import { bedrockProviderModule } from "@aletheics/zeno-ai/bedrock-provider";
import { registerBunOAuthFlows } from "@aletheics/zeno-ai/bun-oauth";
import { setBedrockProviderModule } from "@aletheics/zeno-ai/compat";
import { APP_NAME } from "../config.ts";

process.title = APP_NAME;
process.emitWarning = (() => {}) as typeof process.emitWarning;
registerBunOAuthFlows();
setBedrockProviderModule(bedrockProviderModule);
