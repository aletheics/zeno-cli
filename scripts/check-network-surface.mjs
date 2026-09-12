import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Guards the outbound network surface.
 *
 * The fork's contract is that zeno makes no network request the user did not
 * initiate. That only holds if every hardcoded endpoint is accounted for, so
 * this script inventories them and fails when a new one appears.
 *
 * Upstream merges are the reason this exists: a merge can silently add a
 * telemetry or catalog endpoint. The check turns that into a reviewable diff
 * instead of a runtime surprise.
 *
 * Run `node scripts/check-network-surface.mjs --update` to regenerate the
 * inventory after reviewing what changed.
 */

const INVENTORY_PATH = "scripts/network-surface.json";
const UPDATE = process.argv.includes("--update");
const SOURCE_ROOTS = ["packages"];
const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", "test", "tests", "fixtures", "docs", "examples"]);

// Primitives that can open a connection. List them so a merge cannot introduce
// a new transport without the inventory changing.
const NETWORK_PRIMITIVES = [
	"fetch(",
	"fetchWithRetry(",
	"new WebSocket(",
	'from "node:http"',
	'from "node:https"',
	'from "node:net"',
	'from "node:dgram"',
	'import("node:http")',
	'import("node:https")',
];

const sourceFiles = [];
function collectSourceFiles(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!IGNORED_DIRECTORIES.has(entry.name)) collectSourceFiles(join(directory, entry.name));
			continue;
		}
		if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(join(directory, entry.name));
	}
}
for (const root of SOURCE_ROOTS) {
	for (const packageDir of readdirSync(root, { withFileTypes: true })) {
		if (!packageDir.isDirectory()) continue;
		const src = join(root, packageDir.name, "src");
		if (existsSync(src)) collectSourceFiles(src);
		const nested = join(root, packageDir.name);
		for (const sub of readdirSync(nested, { withFileTypes: true })) {
			if (!sub.isDirectory()) continue;
			const nestedSrc = join(nested, sub.name, "src");
			if (existsSync(nestedSrc)) collectSourceFiles(nestedSrc);
		}
	}
}

// Strip block comments and line comments. `//` inside a URL is preceded by ':'
// and is therefore not treated as a comment start.
function stripComments(text) {
	return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

// Host literals must contain a dot and end in an alphanumeric, so a template
// prefix like `https://api.${domain}` is not recorded as the bogus host `api.`.
const hostPattern = /https?:\/\/([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;
// Template hosts are recorded separately and marked `<dynamic>`: they cannot be
// allowlisted by name, but a new one must still be reviewed.
const dynamicHostPattern = /https?:\/\/([A-Za-z0-9.-]+)\$\{/g;
const foundHosts = new Map();
const foundPrimitives = new Set();

for (const file of sourceFiles.sort()) {
	const text = stripComments(readFileSync(file, "utf8"));
	const where = relative(".", file).replace(/\\/g, "/");

	for (const match of text.matchAll(hostPattern)) {
		const host = match[1];
		if (!foundHosts.has(host)) foundHosts.set(host, new Set());
		foundHosts.get(host).add(where);
	}

	for (const match of text.matchAll(dynamicHostPattern)) {
		const host = `<dynamic> ${match[1]}${"${...}"}`;
		if (!foundHosts.has(host)) foundHosts.set(host, new Set());
		foundHosts.get(host).add(where);
	}

	for (const primitive of NETWORK_PRIMITIVES) {
		if (text.includes(primitive)) foundPrimitives.add(primitive);
	}
}

const inventory = existsSync(INVENTORY_PATH)
	? JSON.parse(readFileSync(INVENTORY_PATH, "utf8"))
	: { categories: {}, hosts: {}, primitives: [] };

if (UPDATE) {
	const merged = { categories: inventory.categories, hosts: {}, primitives: [...foundPrimitives].sort() };
	for (const [host, files] of [...foundHosts].sort()) {
		merged.hosts[host] = { category: inventory.hosts?.[host]?.category ?? "unclassified", files: [...files].sort() };
	}
	writeFileSync(INVENTORY_PATH, `${JSON.stringify(merged, null, "\t")}\n`);
	console.log(`Wrote ${INVENTORY_PATH}: ${Object.keys(merged.hosts).length} hosts, ${merged.primitives.length} primitives`);
	process.exit(0);
}

const failures = [];

for (const host of [...foundHosts.keys()].sort()) {
	if (!(host in (inventory.hosts ?? {}))) failures.push(`new outbound host not in ${INVENTORY_PATH}: ${host}`);
}

for (const primitive of [...foundPrimitives].sort()) {
	if (!(inventory.primitives ?? []).includes(primitive)) failures.push(`new network primitive: ${primitive}`);
}

for (const host of Object.keys(inventory.hosts ?? {}).sort()) {
	if (!foundHosts.has(host)) failures.push(`stale entry (host no longer referenced): ${host} — rerun with --update`);
}

if (failures.length > 0) {
	console.error("Outbound network surface changed:");
	for (const failure of failures) console.error(`  ${failure}`);
	console.error(`\nReview each endpoint, classify it in ${INVENTORY_PATH}, then rerun with --update.`);
	process.exit(1);
}

const unsolicited = Object.entries(inventory.hosts ?? {})
	.filter(([, meta]) => meta.category === "unsolicited")
	.map(([host]) => host);

const ambientOptIn = Object.entries(inventory.hosts ?? {})
	.filter(([, meta]) => meta.category === "ambient-opt-in")
	.map(([host]) => host);

console.log(`Network surface: ${foundHosts.size} hosts, ${foundPrimitives.size} primitives.`);
if (unsolicited.length > 0) {
	console.log(`  ${unsolicited.length} UNSOLICITED (fires without user action): ${unsolicited.join(", ")}`);
	console.log("  This should be empty. Either gate it behind ambient network or reclassify with --update.");
}
if (ambientOptIn.length > 0) {
	console.log(`  ${ambientOptIn.length} ambient, opt-in only (--online / PI_ONLINE=1): ${ambientOptIn.join(", ")}`);
}
