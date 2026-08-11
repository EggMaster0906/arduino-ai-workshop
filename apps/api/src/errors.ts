export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  public constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ProviderError extends Error {
  public readonly code: "AI_TIMEOUT" | "AI_RESPONSE_INVALID" | "AI_UNAVAILABLE";

  public constructor(code: ProviderError["code"]) {
    super(code);
    this.name = "ProviderError";
    this.code = code;
  }
}
