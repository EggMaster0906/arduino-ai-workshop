import type { PromptTaskWithGuidance } from "./types";

const aiHelpOptions = [
  { id: "hint", label: "給我提示，不要直接給完整答案" },
  { id: "step-by-step", label: "一步一步教我" },
  { id: "write-and-explain", label: "寫完整程式，並逐段解釋" },
  { id: "explain", label: "解釋我已有的程式" },
  { id: "debug", label: "幫我依現象找問題" },
] as const;

export const servoGatePromptTask: PromptTaskWithGuidance = {
  id: "servo-gate",
  title: "練習任務：Serial 控制小柵欄",
  description: "將模糊想法拆成 AI 能理解、但不會自行猜測的需求。",
  fields: [
    {
      id: "goal",
      label: "🎯 我要做什麼？",
      helperText: "描述作品要達成的效果。",
      type: "textarea",
      required: true,
      placeholder: "例如：做一個可以開關的簡易柵欄。",
    },
    {
      id: "hardware",
      label: "🧰 我有哪些材料？",
      helperText: "只勾選或寫下你真的有的硬體。",
      type: "checkbox-group",
      required: true,
      options: [
        { id: "uno", label: "Arduino UNO" },
        { id: "sg90", label: "SG90 Servo" },
        { id: "computer", label: "電腦與 Arduino IDE" },
      ],
    },
    {
      id: "control",
      label: "🎮 我要怎麼控制？",
      helperText: "說明誰發出指令、從哪裡輸入。",
      type: "textarea",
      required: true,
      placeholder: "例如：從 Serial Monitor 輸入 OPEN 或 CLOSE。",
    },
    {
      id: "logic",
      label: "🧠 遇到不同情況，要怎麼做？",
      helperText: "使用「情況 → 動作」的方式最清楚。",
      type: "textarea",
      required: true,
      placeholder: "OPEN → Servo 到 90°；CLOSE → Servo 回到 0°。",
    },
    {
      id: "servoPin",
      label: "🔌 Servo 訊號線接在哪一腳？",
      helperText: "AI 不能替你猜接線；請查看你的實際接線。",
      type: "text",
      required: false,
      placeholder: "例如：D9",
    },
    {
      id: "aiHelp",
      label: "🤖 我要 AI 怎麼幫？",
      helperText: "先決定 AI 的角色，才不會把所有事情都交給它。",
      type: "select",
      required: true,
      options: aiHelpOptions,
    },
  ],
  clarifications: [
    {
      field: "servoPin",
      question: "SG90 的訊號線實際接在 Arduino 的哪一個腳位？",
      options: ["D9", "D10", "其他（請回上一頁填寫）"],
    },
  ],
  template: `我正在進行一個 Arduino 專案。

【目標】
{{goal}}

【硬體】
{{hardware}}

【控制方式】
{{control}}

【控制邏輯】
{{logic}}

【接線】
SG90 的訊號線接在 {{servoPin}}。

【需要 AI 協助】
{{aiHelp}}

我是 Arduino 初學者。請使用容易理解的方式回答；如果資訊仍不足，請指出缺少的資訊，不要自行假設。`,
  studentReminder:
    "你可以使用網站內建 Coding AI，也可以複製最終 Prompt，貼到自己的 Coding AI 或 Gemini、ChatGPT、Copilot 等生成式 AI 對話中。",
};

export const smartShadePromptTask: PromptTaskWithGuidance = {
  id: "smart-shade",
  title: "最終挑戰：智慧遮光板",
  description: "把第一章學到的 Input → Process → Output 轉成可以測試的 AI 協作需求。",
  fields: [
    {
      id: "goal",
      label: "🎯 我要做什麼？",
      helperText: "清楚寫出亮與暗時，遮光板各要怎麼動。",
      type: "textarea",
      required: true,
      placeholder: "例如：越亮越關閉、越暗越打開的智慧遮光板。",
    },
    {
      id: "hardware",
      label: "🧰 我有哪些材料？",
      helperText: "只列出桌上真正可用的材料。",
      type: "checkbox-group",
      required: true,
      options: [
        { id: "uno", label: "Arduino UNO" },
        { id: "ldr", label: "光敏電阻與固定電阻（分壓）" },
        { id: "sg90", label: "SG90 Servo" },
      ],
    },
    {
      id: "control",
      label: "🎮 我要讀取什麼輸入？",
      helperText: "想想感測器、Arduino 腳位與要讀的數值。",
      type: "textarea",
      required: true,
      placeholder: "例如：從 A0 讀取光敏電阻的類比數值。",
    },
    {
      id: "logic",
      label: "🧠 數值要怎麼變成動作？",
      helperText: "可寫出 map 範圍、亮暗方向與 Servo 角度。",
      type: "textarea",
      required: true,
      placeholder: "例如：把 0–1023 對應到 180–0 度，越亮角度越小。",
    },
    {
      id: "servoPin",
      label: "🔌 Servo 訊號線接在哪一腳？",
      helperText: "依照你的實際接線填寫，不能由 AI 猜測。",
      type: "text",
      required: true,
      placeholder: "例如：D9",
    },
    {
      id: "aiHelp",
      label: "🤖 我要 AI 怎麼幫？",
      helperText: "本關建議請 AI 產生程式並解釋。",
      type: "select",
      required: true,
      options: aiHelpOptions,
    },
  ],
  clarifications: [
    {
      field: "logic",
      question: "請補充：環境越亮時，Servo 應該往哪個方向／角度移動？",
    },
    {
      field: "servoPin",
      question: "你的 SG90 訊號線接在哪一個 Arduino 腳位？",
    },
  ],
  template: `我正在使用 Arduino UNO 製作智慧遮光板。

【目標】
{{goal}}

【硬體】
{{hardware}}

【輸入與控制】
{{control}}

【控制邏輯】
{{logic}}

【接線】
SG90 的訊號線接在 {{servoPin}}。

【需要 AI 協助】
{{aiHelp}}

我是 Arduino 初學者。請產生適合 Arduino UNO 的簡單程式，並逐段解釋 analogRead、map 與 motor.write 的作用。如果資訊不足，請先提問，不要自行假設硬體或腳位。`,
  studentReminder:
    "AI 的程式必須貼到 Arduino IDE、Upload 並實機測試；看到程式不代表作品已完成。",
};

export const arduinoAiIntroPromptTasks = [servoGatePromptTask, smartShadePromptTask] as const;
