import type { CodeResponse, DebugResponse, PromptCoachResponse } from "@arduino-ai/shared";

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

export const mockCodingAiSuccess: CodeResponse = {
  language: "cpp",
  message:
    "這份程式先讀取 Serial Monitor 的文字，再依 OPEN 或 CLOSE 讓 Servo 移動。請確認訊號線真的接在 D9。",
  code: `#include <Servo.h>

Servo motor;
const int servoPin = 9;

void setup() {
  Serial.begin(9600);
  motor.attach(servoPin);
  motor.write(0);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\\n');
    command.trim();

    if (command == "OPEN") {
      motor.write(90);
    } else if (command == "CLOSE") {
      motor.write(0);
    }
  }
}`,
};

export const mockCodingAiSmartShade: CodeResponse = {
  language: "cpp",
  message:
    "這份範例把 A0 的光線讀值轉成 Servo 角度。最後兩個 map 參數決定亮暗時的方向，請依你實際讀到的數值確認。",
  code: `#include <Servo.h>

Servo motor;
const int lightPin = A0;
const int servoPin = 9;

void setup() {
  Serial.begin(9600);
  motor.attach(servoPin);
}

void loop() {
  int lightValue = analogRead(lightPin);
  int angle = map(lightValue, 0, 1023, 180, 0);
  angle = constrain(angle, 10, 170);
  motor.write(angle);

  Serial.print(lightValue);
  Serial.print(" -> ");
  Serial.println(angle);
  delay(100);
}`,
};

export const mockDebugServoNoMovement: DebugResponse = {
  analysis:
    "程式已 Compile 且 Upload 成功，先不要整份重寫。Servo 不動時，常見原因是供電／共地、訊號腳位或實際指令格式不一致。",
  checks: [
    "確認 Servo 的 GND 與 Arduino GND 共地，紅線接到穩定的 5V 電源。",
    "確認橘色／黃色訊號線真的接在程式使用的 D9，而不是相鄰腳位。",
    "在 Serial Monitor 選擇換行結尾，輸入大寫 OPEN 後觀察是否收到指令。",
    "暫時在 setup() 寫 motor.write(90)，確認 Servo 與接線本身能動。",
  ],
  suggestedCode: `// 先放在 setup() 最後一行測試 Servo 與接線：
motor.write(90);`,
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
  mockCodingAiSuccess,
  mockCodingAiSmartShade,
  mockDebugServoNoMovement,
  mockTimeout,
} as const;
