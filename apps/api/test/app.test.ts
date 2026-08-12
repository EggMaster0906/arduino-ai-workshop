import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig, type ApiConfig } from "../src/config.js";

const firstSession = "0e6ccab8-4d42-4b71-8fd7-6d8437ee12a1";
const secondSession = "37b1258d-2ae8-48d3-8a42-c2c1cf64401b";

function testConfig(overrides: Record<string, string> = {}): ApiConfig {
  return loadConfig({
    NODE_ENV: "test",
    FRONTEND_ORIGIN: "https://course.example.test",
    ...overrides
  });
}

const completeRequirements = {
  goal: "做一個可以開關的柵欄",
  hardware: ["Arduino UNO", "SG90 訊號線接 D9"],
  control: "使用 Serial Monitor 輸入文字",
  logic: ["OPEN 時打開", "CLOSE 時關閉"],
  aiHelp: "產生程式並逐段解釋"
};

describe("API routes", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ config: testConfig() });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns health status and security headers", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("allows only the configured browser origin", async () => {
    const accepted = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://course.example.test" }
    });
    const rejected = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://untrusted.example.test" }
    });

    expect(accepted.headers["access-control-allow-origin"]).toBe("https://course.example.test");
    expect(rejected.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("keeps the Prompt Coach deterministic when a servo pin is missing", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: {
        taskId: "servo-gate",
        anonymousSessionId: firstSession,
        requirements: {
          ...completeRequirements,
          hardware: ["Arduino UNO", "SG90"]
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      complete: false,
      missingFields: [
        {
          field: "servoPin"
        }
      ],
      prompt: null
    });
  });

  it("builds a final prompt only after requirements are complete", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: {
        taskId: "servo-gate",
        anonymousSessionId: firstSession,
        requirements: completeRequirements
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      complete: true,
      missingFields: [],
      prompt: expect.stringContaining("SG90 訊號線接 D9")
    });
  });

  it("asks for a complete Servo control logic instead of accepting a vague statement", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: {
        taskId: "servo-gate",
        anonymousSessionId: firstSession,
        requirements: { ...completeRequirements, logic: ["讓 Servo 控制柵欄"] }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      complete: false,
      missingFields: [
        { field: "logic" }
      ],
      prompt: null
    });
  });

  it("accepts the newline-delimited fields and separate servo pin sent by the web Prompt Builder", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: {
        taskId: "servo-gate",
        anonymousSessionId: firstSession,
        requirements: {
          goal: "做一個可以開關的柵欄",
          hardware: "Arduino UNO\nSG90",
          control: "使用 Serial Monitor 輸入文字",
          logic: "OPEN 時打開；CLOSE 時關閉",
          servoPin: "D9",
          aiHelp: "產生程式並逐段解釋"
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      complete: true,
      missingFields: [],
      structuredRequirement: {
        hardware: ["Arduino UNO", "SG90", "SG90 Servo 訊號線接 D9"],
        logic: ["OPEN 時打開；CLOSE 時關閉"]
      },
      prompt: expect.stringContaining("SG90 Servo 訊號線接 D9")
    });
  });

  it("returns a generic validation error without Zod internals", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: { taskId: "servo-gate" }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "輸入資料格式不正確，請檢查後再試。"
      }
    });
  });

  it("does not expose built-in code generation or debug AI routes", async () => {
    const codeResponse = await app.inject({
      method: "POST",
      url: "/api/ai/code",
      payload: {}
    });
    const debugResponse = await app.inject({
      method: "POST",
      url: "/api/ai/debug",
      payload: {}
    });

    expect(codeResponse.statusCode).toBe(404);
    expect(debugResponse.statusCode).toBe(404);
  });

  it("hides malformed provider output behind a generic retry-safe error", async () => {
    await app.close();
    app = await buildApp({ config: testConfig({ MOCK_AI_SCENARIO: "malformed" }) });

    const response = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      payload: {
        taskId: "servo-gate",
        anonymousSessionId: firstSession,
        requirements: completeRequirements
      }
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "AI_RESPONSE_INVALID",
        message: "AI 目前暫時無法回覆。你填寫的資料不會消失，可以再次嘗試。"
      }
    });
  });

  it("rate limits by anonymous session instead of shared classroom IP", async () => {
    await app.close();
    app = await buildApp({ config: testConfig({ PROMPT_COACH_RATE_LIMIT: "1" }) });

    const first = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      remoteAddress: "203.0.113.20",
      payload: { taskId: "servo-gate", anonymousSessionId: firstSession, requirements: completeRequirements }
    });
    const differentSession = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      remoteAddress: "203.0.113.20",
      payload: { taskId: "servo-gate", anonymousSessionId: secondSession, requirements: completeRequirements }
    });
    const repeatedSession = await app.inject({
      method: "POST",
      url: "/api/prompt/coach",
      remoteAddress: "203.0.113.20",
      payload: { taskId: "servo-gate", anonymousSessionId: firstSession, requirements: completeRequirements }
    });

    expect(first.statusCode).toBe(200);
    expect(differentSession.statusCode).toBe(200);
    expect(repeatedSession.statusCode).toBe(429);
    expect(repeatedSession.json()).toMatchObject({ error: { code: "RATE_LIMITED" } });
  });
});
