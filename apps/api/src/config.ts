import { z } from "zod";

const providerSchema = z.enum(["mock", "codex"]);

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_ORIGIN: z.string().trim().min(1).default("http://localhost:5173"),
  AI_PROVIDER: providerSchema.default("mock"),
  PROMPT_COACH_PROVIDER: providerSchema.optional(),
  CODEX_MODEL: z.literal("gpt-5.4-mini").default("gpt-5.4-mini"),
  CODEX_API_KEY: z.string().trim().min(1).optional(),
  CODEX_WORKDIR: z.string().trim().min(1).default("/tmp/arduino-ai-codex-workdir"),
  MAX_AI_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(5),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(60_000),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(130_000).default(65_000),
  REQUEST_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(262_144).default(65_536),
  PROMPT_COACH_RATE_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
  MOCK_AI_SCENARIO: z.enum(["success", "incomplete", "timeout", "malformed"]).default("success")
});

export interface ApiConfig {
  port: number;
  nodeEnv: "development" | "test" | "production";
  frontendOrigins: string[];
  providers: {
    promptCoach: "mock" | "codex";
  };
  codex: {
    model: "gpt-5.4-mini";
    apiKey?: string;
    workdir: string;
  };
  maxAiConcurrency: number;
  aiRequestTimeoutMs: number;
  requestTimeoutMs: number;
  requestBodyLimitBytes: number;
  rateLimits: {
    promptCoach: number;
  };
  mockScenario: "success" | "incomplete" | "timeout" | "malformed";
}

function parseOrigins(value: string): string[] {
  const origins = value
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (origins.length === 0 || origins.some((origin) => origin === "*")) {
    throw new Error("FRONTEND_ORIGIN 必須設定至少一個明確 Origin，且不可使用 *。");
  }

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("FRONTEND_ORIGIN 必須是有效的 http 或 https Origin。");
    }
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.origin !== origin) {
      throw new Error("FRONTEND_ORIGIN 必須是沒有路徑的 http 或 https Origin。");
    }
  }

  return [...new Set(origins)];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const parsed = environmentSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error("後端環境變數設定無效。請檢查 .env 設定。");
  }

  const value = parsed.data;
  const providers = {
    promptCoach: value.PROMPT_COACH_PROVIDER ?? value.AI_PROVIDER
  };

  return {
    port: value.PORT,
    nodeEnv: value.NODE_ENV,
    frontendOrigins: parseOrigins(value.FRONTEND_ORIGIN),
    providers,
    codex: {
      model: value.CODEX_MODEL,
      apiKey: value.CODEX_API_KEY,
      workdir: value.CODEX_WORKDIR
    },
    maxAiConcurrency: value.MAX_AI_CONCURRENCY,
    aiRequestTimeoutMs: value.AI_REQUEST_TIMEOUT_MS,
    requestTimeoutMs: value.REQUEST_TIMEOUT_MS,
    requestBodyLimitBytes: value.REQUEST_BODY_LIMIT_BYTES,
    rateLimits: {
      promptCoach: value.PROMPT_COACH_RATE_LIMIT
    },
    mockScenario: value.MOCK_AI_SCENARIO
  };
}
