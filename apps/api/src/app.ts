import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import {
  promptCoachRequestSchema,
  type PromptCoachRequest
} from "@arduino-ai/shared";
import { z } from "zod";
import { loadConfig, type ApiConfig } from "./config.js";
import { ApiError, ProviderError } from "./errors.js";
import { ConcurrencyLimiter } from "./lib/concurrency-limiter.js";
import { createProvider } from "./providers/factory.js";
import type { AIProvider } from "./providers/types.js";
import { PromptCoachService } from "./services/ai-service.js";

interface Providers {
  promptCoach: AIProvider;
}

export interface AppOptions {
  config?: ApiConfig;
  providers?: Partial<Providers>;
  limiter?: ConcurrencyLimiter;
}

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "輸入資料格式不正確，請檢查後再試。");
  }
  return parsed.data;
}

function sessionRateKey(request: FastifyRequest): string {
  const body = request.body;
  if (
    body &&
    typeof body === "object" &&
    "anonymousSessionId" in body &&
    typeof body.anonymousSessionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.anonymousSessionId)
  ) {
    return `session:${body.anonymousSessionId}`;
  }
  return `ip:${request.ip}`;
}

function mapProviderError(error: ProviderError): ApiError {
  if (error.code === "AI_TIMEOUT") {
    return new ApiError(504, "AI_TIMEOUT", "AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。");
  }

  return new ApiError(503, error.code, "AI 目前暫時無法回覆。你填寫的資料不會消失，可以再次嘗試。");
}

function errorStatusCode(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number"
    ? error.statusCode
    : undefined;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

function makeProviders(config: ApiConfig, overrides: Partial<Providers>): Providers {
  return {
    promptCoach: overrides.promptCoach ?? createProvider(config.providers.promptCoach, config)
  };
}

export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const providers = makeProviders(config, options.providers ?? {});
  const limiter = options.limiter ?? new ConcurrencyLimiter(config.maxAiConcurrency);
  const promptCoach = new PromptCoachService(providers.promptCoach, config.aiRequestTimeoutMs);

  const app = Fastify({
    logger: config.nodeEnv !== "test",
    bodyLimit: config.requestBodyLimitBytes,
    requestTimeout: config.requestTimeoutMs,
    // Codex may take up to AI_REQUEST_TIMEOUT_MS. Keep the client socket alive
    // long enough to receive the mapped timeout or the provider response.
    connectionTimeout: config.requestTimeoutMs + 5_000
  });

  await app.register(helmet);
  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: false,
    methods: ["GET", "POST"]
  });
  await app.register(rateLimit, {
    global: false,
    hook: "preHandler",
    errorResponseBuilder: (_request, context) => ({
      statusCode: context.statusCode,
      error: {
        code: "RATE_LIMITED",
        message: "請稍後再試，避免短時間重複送出。"
      }
    })
  });

  app.setErrorHandler((error, request, reply) => {
    let apiError: ApiError;
    if (error instanceof ApiError) {
      apiError = error;
    } else if (error instanceof ProviderError) {
      apiError = mapProviderError(error);
    } else if (errorStatusCode(error) === 429) {
      apiError = new ApiError(429, "RATE_LIMITED", "請稍後再試，避免短時間重複送出。");
    } else if (errorStatusCode(error) === 413 || errorCode(error) === "FST_ERR_CTP_BODY_TOO_LARGE") {
      apiError = new ApiError(413, "REQUEST_TOO_LARGE", "輸入內容過長，請縮短後再試。");
    } else {
      apiError = new ApiError(500, "INTERNAL_ERROR", "系統目前無法完成這個操作，請稍後再試。");
    }

    if (apiError.statusCode >= 500) {
      request.log.error({ requestId: request.id, code: apiError.code }, "API request failed");
    } else {
      request.log.warn({ requestId: request.id, code: apiError.code }, "API request rejected");
    }

    return reply.status(apiError.statusCode).send({
      error: {
        code: apiError.code,
        message: apiError.message
      }
    });
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post(
    "/api/prompt/coach",
    {
      config: {
        rateLimit: {
          max: config.rateLimits.promptCoach,
          timeWindow: "1 minute",
          keyGenerator: sessionRateKey
        }
      }
    },
    async (request) => {
      const body = parseBody<PromptCoachRequest>(promptCoachRequestSchema, request.body);
      const result = await limiter.tryRun(() => promptCoach.coach(body));
      if (!result) {
        throw new ApiError(503, "AI_BUSY", "AI 正在協助其他同學，請稍後再試。");
      }
      return result;
    }
  );

  return app;
}
