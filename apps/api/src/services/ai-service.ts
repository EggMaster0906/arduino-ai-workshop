import {
  buildArduinoPrompt,
  codeResponseSchema,
  debugResponseSchema,
  missingFieldSchema,
  type CodeRequest,
  type CodeResponse,
  type DebugRequest,
  type DebugResponse,
  type PromptCoachRequest,
  type PromptCoachResponse
} from "@arduino-ai/shared";
import { z } from "zod";
import { ProviderError } from "../errors.js";
import { withTimeout } from "../lib/timeout.js";
import { buildCoachInstruction, buildCodeInstruction, buildDebugInstruction } from "../providers/prompt-builders.js";
import type { AIProvider } from "../providers/types.js";

const coachAssessmentSchema = z
  .object({
    missingFields: z.array(missingFieldSchema).max(5)
  })
  .strict();

type MissingField = z.infer<typeof missingFieldSchema>;

function valueAsText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function valueAsTextList(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function normalizeRequirement(request: PromptCoachRequest) {
  const hardware = valueAsTextList(request.requirements.hardware);
  const servoPin = valueAsText(request.requirements.servoPin);
  if (servoPin && !hardware.some((item) => item.includes(servoPin))) {
    hardware.push(`SG90 Servo 訊號線接 ${servoPin}`);
  }

  return {
    goal: valueAsText(request.requirements.goal),
    hardware,
    control: valueAsText(request.requirements.control),
    logic: valueAsTextList(request.requirements.logic),
    aiHelp: valueAsText(request.requirements.aiHelp)
  };
}

function basicMissingFields(requirement: ReturnType<typeof normalizeRequirement>): MissingField[] {
  const missing: MissingField[] = [];
  if (!requirement.goal) {
    missing.push({ field: "goal", question: "你想做出什麼作品或效果？" });
  }
  if (requirement.hardware.length === 0) {
    missing.push({ field: "hardware", question: "請列出你現在會使用的 Arduino、感測器或輸出裝置。" });
  }
  if (!requirement.control) {
    missing.push({ field: "control", question: "你想用什麼方式控制這個作品？" });
  }
  if (requirement.logic.length === 0) {
    missing.push({ field: "logic", question: "不同情況發生時，你希望 Arduino 分別怎麼做？" });
  }
  if (!requirement.aiHelp) {
    missing.push({ field: "aiHelp", question: "你希望 AI 提示、逐步教學、寫程式，還是解釋程式？" });
  }
  return missing;
}

function taskSpecificMissingFields(taskId: string, requirement: ReturnType<typeof normalizeRequirement>): MissingField[] {
  const requiresServoPin = new Set(["servo-gate", "smart-shade"]);
  if (!requiresServoPin.has(taskId)) {
    return [];
  }

  const allDetails = [
    ...requirement.hardware,
    requirement.control,
    ...requirement.logic
  ].join(" ");
  const hasServo = /\b(?:sg90|servo)\b/i.test(allDetails);
  const hasPin = /\b(?:d\s*)?(?:[0-9]|1[0-3])\b/i.test(allDetails);

  return hasServo && !hasPin
    ? [{ field: "servoPin", question: "SG90 的訊號線接在哪一個 Arduino 腳位？" }]
    : [];
}

function deDuplicateMissingFields(fields: MissingField[]): MissingField[] {
  const found = new Set<string>();
  return fields.filter((field) => {
    if (found.has(field.field)) {
      return false;
    }
    found.add(field.field);
    return true;
  });
}

function validateProviderResponse<T>(schema: z.ZodType<T>, response: unknown): T {
  const result = schema.safeParse(response);
  if (!result.success) {
    throw new ProviderError("AI_RESPONSE_INVALID");
  }
  return result.data;
}

export class PromptCoachService {
  public constructor(
    private readonly provider: AIProvider,
    private readonly timeoutMs: number
  ) {}

  public async coach(request: PromptCoachRequest): Promise<PromptCoachResponse> {
    const structuredRequirement = normalizeRequirement(request);
    const deterministicMissing = [
      ...basicMissingFields(structuredRequirement),
      ...taskSpecificMissingFields(request.taskId, structuredRequirement)
    ];

    if (deterministicMissing.length > 0) {
      return {
        complete: false,
        missingFields: deterministicMissing,
        structuredRequirement,
        prompt: null
      };
    }

    const response = await withTimeout(
      this.provider.generate({ task: "prompt-coach", prompt: buildCoachInstruction(request) }),
      this.timeoutMs
    );
    const assessment = validateProviderResponse(coachAssessmentSchema, response);
    const missingFields = deDuplicateMissingFields(assessment.missingFields);

    return {
      complete: missingFields.length === 0,
      missingFields,
      structuredRequirement,
      prompt: missingFields.length === 0 ? buildArduinoPrompt(structuredRequirement) : null
    };
  }
}

export class CodingService {
  public constructor(
    private readonly provider: AIProvider,
    private readonly timeoutMs: number
  ) {}

  public async generate(request: CodeRequest): Promise<CodeResponse> {
    const response = await withTimeout(
      this.provider.generate({ task: "code", prompt: buildCodeInstruction(request.prompt) }),
      this.timeoutMs
    );
    return validateProviderResponse(codeResponseSchema, response);
  }
}

export class DebugService {
  public constructor(
    private readonly provider: AIProvider,
    private readonly timeoutMs: number
  ) {}

  public async debug(request: DebugRequest): Promise<DebugResponse> {
    const response = await withTimeout(
      this.provider.generate({ task: "debug", prompt: buildDebugInstruction(request) }),
      this.timeoutMs
    );
    return validateProviderResponse(debugResponseSchema, response);
  }
}
