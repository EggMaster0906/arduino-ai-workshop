import type { ApiConfig } from "../config.js";
import { CodexProvider } from "./codex-provider.js";
import { MockProvider } from "./mock-provider.js";
import type { AIProvider } from "./types.js";

export function createProvider(kind: "mock" | "codex", config: ApiConfig): AIProvider {
  if (kind === "mock") {
    return new MockProvider(config.mockScenario);
  }

  if (!config.codex.apiKey) {
    throw new Error("Codex Provider 缺少 CODEX_API_KEY。");
  }

  return new CodexProvider({
    model: config.codex.model,
    apiKey: config.codex.apiKey,
    workdir: config.codex.workdir,
    timeoutMs: config.aiRequestTimeoutMs
  });
}
