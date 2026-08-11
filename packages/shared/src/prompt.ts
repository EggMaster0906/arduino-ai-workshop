export interface ArduinoRequirement {
  goal: string;
  hardware: string[];
  control: string;
  logic: string[];
  aiHelp: string;
}

export function buildArduinoPrompt(requirement: ArduinoRequirement): string {
  return [
    "我正在進行一個 Arduino 專案。",
    "",
    "【目標】",
    requirement.goal,
    "",
    "【硬體】",
    ...requirement.hardware.map((item) => `- ${item}`),
    "",
    "【控制方式】",
    requirement.control,
    "",
    "【控制邏輯】",
    ...requirement.logic.map((item) => `- ${item}`),
    "",
    "【需要 AI 協助】",
    requirement.aiHelp,
    "",
    "我是 Arduino 初學者，請使用容易理解的方式回答。",
    "如果資訊不足，請先指出缺少的資訊，不要自行假設。"
  ].join("\n");
}
