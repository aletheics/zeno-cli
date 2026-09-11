import { expect } from "vitest";
import { describeEval } from "vitest-evals";
import { createZenoCodingAgentHarness } from "./zeno-harness.ts";

const zenoCodingAgentHarness = createZenoCodingAgentHarness({ noTools: "all" });

describeEval("Zeno Coding Agent smoke", { harness: zenoCodingAgentHarness }, (it) => {
	it("runs a basic prompt end to end", async ({ run }) => {
		const result = await run("What's the capital of France? Respond with only the city name.");

		expect(result.output.trim()).toBe("Paris");
		expect(result.errors).toEqual([]);
		expect(result.usage.provider).toBe(process.env.PI_PROVIDER);
		expect(result.usage.model).toBe(process.env.PI_MODEL);
		expect(result.usage.totalTokens).toBeGreaterThan(0);
	});
});
