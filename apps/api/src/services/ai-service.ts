import {
  buildArduinoPrompt,
  missingFieldSchema,
  type PromptCoachRequest,
  type PromptCoachResponse
} from "@arduino-ai/shared";
import { z } from "zod";
import { ProviderError } from "../errors.js";
import { withTimeout } from "../lib/timeout.js";
import { buildCoachInstruction } from "../providers/prompt-builders.js";
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
  const allDetails = [
    ...requirement.hardware,
    requirement.control,
    ...requirement.logic
  ].join(" ");
  const hasServo = /\b(?:sg90|servo)\b/i.test(allDetails);
  const hasPin = /\bD\s*(?:[0-9]|1[0-3])\b/i.test(allDetails);
  const logic = requirement.logic.join(" ");
  const hasConditionToAction = /(?:→|=>|當|如果|若|時|對應|變成)/.test(logic);
  const missing: MissingField[] = [];

  if (requiresServoPin.has(taskId) && hasServo && !hasPin) {
    missing.push({ field: "servoPin", question: "SG90 的訊號線接在哪一個 Arduino 腳位？" });
  }

  if (taskId === "servo-gate") {
    const hasOpenCase = /\bopen\b|打開|開啟/i.test(logic);
    const hasCloseCase = /\bclose\b|關閉|關上/i.test(logic);
    if (!hasOpenCase || !hasCloseCase || !hasConditionToAction) {
      missing.push({
        field: "logic",
        question: "請分別寫出收到 OPEN 與 CLOSE 時，Servo 要轉到哪個角度或做什麼動作（例如 OPEN → 90°；CLOSE → 0°）。"
      });
    }
  }

  if (taskId === "smart-shade") {
    const hasLightCondition = /亮|暗|光|數值/.test(logic);
    const hasOutputAction = /servo|伺服|角度|度|打開|關閉|轉到/i.test(logic);
    if (!hasLightCondition || !hasOutputAction || !hasConditionToAction) {
      missing.push({
        field: "logic",
        question: "請寫出亮／暗（或感測數值）各自對應的 Servo 動作或角度，並標示條件與動作的關係。"
      });
    }
  }

  return missing;
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
