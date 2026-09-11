import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export const workspaceSourcePaths = {
	chordIndex: fileURLToPath(new URL("./packages/chord/src/index.ts", import.meta.url)),
	chordContext: fileURLToPath(new URL("./packages/chord/src/context/index.ts", import.meta.url)),
	chordDelta: fileURLToPath(new URL("./packages/chord/src/delta/index.ts", import.meta.url)),
	chordBundler: fileURLToPath(new URL("./packages/chord/src/bundler.ts", import.meta.url)),
	chordNode: fileURLToPath(new URL("./packages/chord/src/node.ts", import.meta.url)),
	telemetryIndex: fileURLToPath(new URL("./packages/telemetry/src/index.ts", import.meta.url)),
	telemetryTesting: fileURLToPath(new URL("./packages/telemetry/src/testing/index.ts", import.meta.url)),
	aiIndex: fileURLToPath(new URL("./packages/ai/src/index.ts", import.meta.url)),
	aiCompat: fileURLToPath(new URL("./packages/ai/src/compat.ts", import.meta.url)),
	aiOAuth: fileURLToPath(new URL("./packages/ai/src/oauth.ts", import.meta.url)),
	aiProviders: fileURLToPath(new URL("./packages/ai/src/providers", import.meta.url)),
	agentIndex: fileURLToPath(new URL("./packages/agent/src/index.ts", import.meta.url)),
	agentNode: fileURLToPath(new URL("./packages/agent/src/node.ts", import.meta.url)),
	protocolIndex: fileURLToPath(new URL("./packages/protocol/src/index.ts", import.meta.url)),
	clientIndex: fileURLToPath(new URL("./packages/client/src/index.ts", import.meta.url)),
	clientUnix: fileURLToPath(new URL("./packages/client/src/unix.ts", import.meta.url)),
	serverIndex: fileURLToPath(new URL("./packages/server/src/index.ts", import.meta.url)),
	serverUnix: fileURLToPath(new URL("./packages/server/src/transports/unix/index.ts", import.meta.url)),
	codingAgentIndex: fileURLToPath(new URL("./packages/coding-agent/src/index.ts", import.meta.url)),
	tuiIndex: fileURLToPath(new URL("./packages/tui/src/index.ts", import.meta.url)),
} as const;

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^@aletheics\/chord$/, replacement: workspaceSourcePaths.chordIndex },
			{ find: /^@aletheics\/chord\/context$/, replacement: workspaceSourcePaths.chordContext },
			{ find: /^@aletheics\/chord\/delta$/, replacement: workspaceSourcePaths.chordDelta },
			{ find: /^@aletheics\/chord\/bundler$/, replacement: workspaceSourcePaths.chordBundler },
			{ find: /^@aletheics\/chord\/node$/, replacement: workspaceSourcePaths.chordNode },
			{ find: /^@aletheics\/zeno-telemetry$/, replacement: workspaceSourcePaths.telemetryIndex },
			{ find: /^@aletheics\/zeno-telemetry\/testing$/, replacement: workspaceSourcePaths.telemetryTesting },
			{ find: /^@aletheics\/zeno-ai$/, replacement: workspaceSourcePaths.aiIndex },
			{ find: /^@aletheics\/zeno-ai\/compat$/, replacement: workspaceSourcePaths.aiCompat },
			{ find: /^@aletheics\/zeno-ai\/oauth$/, replacement: workspaceSourcePaths.aiOAuth },
			{
				find: /^@aletheics\/zeno-ai\/providers\/(.+)$/,
				replacement: `${workspaceSourcePaths.aiProviders}/$1.ts`,
			},
			{ find: /^@aletheics\/zeno-agent-core$/, replacement: workspaceSourcePaths.agentIndex },
			{ find: /^@aletheics\/zeno-agent-core\/node$/, replacement: workspaceSourcePaths.agentNode },
			{ find: /^@aletheics\/zeno-protocol$/, replacement: workspaceSourcePaths.protocolIndex },
			{ find: /^@aletheics\/zeno-client$/, replacement: workspaceSourcePaths.clientIndex },
			{ find: /^@aletheics\/zeno-client\/unix$/, replacement: workspaceSourcePaths.clientUnix },
			{ find: /^@aletheics\/zeno-server$/, replacement: workspaceSourcePaths.serverIndex },
			{ find: /^@aletheics\/zeno-server\/unix$/, replacement: workspaceSourcePaths.serverUnix },
			{ find: /^@aletheics\/zeno-tui$/, replacement: workspaceSourcePaths.tuiIndex },
		],
	},
});
