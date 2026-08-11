export type AiTask = "prompt-coach" | "code" | "debug";

export interface ProviderRequest {
  task: AiTask;
  prompt: string;
}

export interface AIProvider {
  generate(request: ProviderRequest): Promise<unknown>;
}

export type MockScenario = "success" | "incomplete" | "timeout" | "malformed";
