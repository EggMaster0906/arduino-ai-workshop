import type { PromptCoachResponse } from "@arduino-ai/shared";

/** Fixed responses for development, visual regression and E2E tests. */
export const promptCoachIncompleteServoGate: PromptCoachResponse = {
  complete: false,
  missingFields: [
    {
      field: "servoPin",
      question: "SG90 的訊號線接在哪一個 Arduino 腳位？",
    },
  ],
  structuredRequirement: {
    goal: "製作可開關的簡易柵欄",
    hardware: ["Arduino UNO", "SG90 Servo"],
    control: "Serial Monitor",
    logic: ["OPEN 時打開", "CLOSE 時關閉"],
    aiHelp: "寫完整程式，並逐段解釋",
  },
  prompt: null,
};

export const promptCoachCompleteServoGate: PromptCoachResponse = {
  complete: true,
  missingFields: [],
  structuredRequirement: {
    goal: "製作可開關的簡易柵欄",
    hardware: ["Arduino UNO", "SG90 Servo，訊號線接 D9"],
    control: "從 Serial Monitor 輸入 OPEN 或 CLOSE",
    logic: ["OPEN 時 Servo 移到 90°", "CLOSE 時 Servo 回到 0°"],
    servoPin: "D9",
    aiHelp: "寫完整程式，並逐段解釋",
  },
  prompt: `我正在進行一個 Arduino 專案。

【目標】
製作可開關的簡易柵欄

【硬體】
- Arduino UNO
- SG90 Servo，訊號線接 D9

【控制方式】
從 Serial Monitor 輸入 OPEN 或 CLOSE

【控制邏輯】
- OPEN 時 Servo 移到 90°
- CLOSE 時 Servo 回到 0°

【需要 AI 協助】
寫完整程式，並逐段解釋

我是 Arduino 初學者，請使用容易理解的方式回答。
如果資訊不足，請先指出缺少的資訊，不要自行假設。`,
};

export const promptCoachIncompleteSmartShade: PromptCoachResponse = {
  complete: false,
  missingFields: [
    {
      field: "logic",
      question: "環境越亮時，遮光板應往哪個角度移動？",
    },
  ],
  structuredRequirement: {
    goal: "製作智慧遮光板",
    hardware: ["Arduino UNO", "光敏電阻", "SG90 Servo"],
    control: "從 A0 讀取光敏電阻數值",
    logic: [],
  },
  prompt: null,
};

export const mockTimeout = {
  code: "AI_TIMEOUT",
  message: "AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。",
  delayMs: 65_000,
} as const;

export const arduinoAiIntroMockFixtures = {
  promptCoachIncompleteServoGate,
  promptCoachCompleteServoGate,
  promptCoachIncompleteSmartShade,
  mockTimeout,
} as const;
