import type { AIProvider, ProviderRequest, MockScenario } from "./types.js";

const sampleCode = `#include <Servo.h>

Servo motor;
const int servoPin = 9;

void setup() {
  Serial.begin(9600);
  motor.attach(servoPin);
  Serial.println("輸入 OPEN 或 CLOSE");
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
}`;

export class MockProvider implements AIProvider {
  public constructor(private readonly scenario: MockScenario = "success") {}

  public async generate(request: ProviderRequest): Promise<unknown> {
    if (this.scenario === "timeout") {
      return new Promise<never>(() => undefined);
    }

    if (this.scenario === "malformed") {
      return { unexpected: true };
    }

    if (request.task === "prompt-coach") {
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

    if (request.task === "code") {
      return {
        message:
          "這份範例會讀取 Serial Monitor 的 OPEN 與 CLOSE 指令，並讓 SG90 移動。請先確認訊號線接在 D9。",
        code: sampleCode,
        language: "cpp"
      };
    }

    return {
      analysis: "先從最常見、最容易檢查的硬體與設定問題開始確認。",
      checks: [
        "確認 SG90 的紅線、棕線與訊號線沒有接反。",
        "確認程式中的腳位與訊號線實際接的 Arduino 腳位相同。",
        "確認 Servo 有足夠電力，並和 Arduino 共地。"
      ],
      suggestedCode: null
    };
  }
}
