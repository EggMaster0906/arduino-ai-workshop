import type { AIProvider, ProviderRequest, MockScenario } from "./types.js";

export class MockProvider implements AIProvider {
  public constructor(private readonly scenario: MockScenario = "success") {}

  public async generate(request: ProviderRequest): Promise<unknown> {
    if (this.scenario === "timeout") {
      return new Promise<never>(() => undefined);
    }

    if (this.scenario === "malformed") {
      return { unexpected: true };
    }

    return this.scenario === "incomplete"
      ? {
          missingFields: [
            {
              field: "controlDetails",
              question: "請再說明你會輸入什麼指令或如何控制 Arduino。"
            }
          ]
        }
      : { missingFields: [] };
  }
}
