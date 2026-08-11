# Arduino × 生成式 AI 學習平台
# 開發計畫書 / Codex Implementation Specification

> 本文件是直接提供給 Codex 進行開發的主要規格。
> 開發時請優先遵守本文件中的架構、功能範圍、資料模型、UX 流程與安全限制。
> 若部分細節未定義，請選擇簡單、可維護、適合單次課堂使用的方案，不要自行擴張成大型 LMS。

---

# 1. 專案目標

建立一個供國中生在 Arduino 課程中使用的互動式學習網站。

網站需支援兩個主要學習章節：

1. **Arduino 基礎程式設計**
2. **生成式 AI 協作開發**

學生在學校電腦教室中，只需透過瀏覽器開啟網站，即可：

- 閱讀短篇 Arduino 教材
- 完成選擇題、填空題與程式理解題
- 依照網站指示操作 Arduino UNO
- 記錄自己的學習進度
- 使用「五問需求拆解法」建立開發需求
- 由後端 Prompt Coach 協助檢查與整理需求
- 生成最終 Prompt
- 複製 Prompt 到學生自行使用的外部生成式 AI
- 將外部 AI 回傳的 Arduino 程式碼貼回學習區
- 根據實際測試結果進行 Debug
- 完成最終 AI 協作挑戰

---

# 2. 核心設計原則

## 2.1 網站不是傳統 LMS

本系統應該是一個：

> **任務導向、闖關式、Arduino 實作導向的學習網站**

不要設計成：

- 複雜 LMS
- 教師行政平台
- 完整考試系統
- 大量帳號管理系統

第一版應專注於：

- 課程內容呈現
- 關卡進度
- Arduino 實作指引
- Prompt Builder
- AI 協作
- Debug Flow

---

## 2.2 網站負責理解，Arduino 負責驗證

網站不需要模擬 Arduino 執行結果，也不需要建立完整線上 compiler。

學生實際程式執行應使用：

- Arduino IDE
- Arduino UNO
- Serial Monitor
- 實體光敏電阻
- SG90 Servo

網站主要負責：

```text
閱讀教材
 ↓
理解概念
 ↓
完成小題
 ↓
切換 Arduino IDE
 ↓
Upload / 實機測試
 ↓
回網站紀錄結果
```

---

## 2.3 鼓勵 AI，而不是禁止 AI

本課程明確允許並鼓勵學生使用生成式 AI。

但 AI 的學習重點是：

```text
需求
 ↓
拆解
 ↓
Prompt
 ↓
AI
 ↓
程式
 ↓
測試
 ↓
Debug
```

學生必須先整理需求，再真正將 Prompt 交給自己使用的外部生成式 AI。

學生會使用自己的Coding AI，或是將完成的 Prompt 複製貼上到生成式AI的對話中（如Gemini、ChatGPT、Copilot）

網站不提供內建程式生成或 Debug AI，以避免消耗平台擁有者的個人 Codex 使用量；只保留 Prompt Coach 的資訊完整性檢查。學生取得外部 AI 回覆後，將程式碼貼回網站繼續測試與紀錄。

---

# 3. 部署架構

## 3.1 前端

前端部署於：

> **GitHub Pages**

目的：

- 學生可直接使用瀏覽器存取
- 學校電腦不需額外安裝網站程式
- 網站內容由 GitHub Repository 管理
- Push 到 main 後可透過 GitHub Actions 自動部署

建議架構：

```text
GitHub Repository
        ↓
GitHub Actions
        ↓
GitHub Pages
        ↓
學生瀏覽器
```

---

## 3.2 後端

GitHub Pages 僅負責靜態前端。

AI 功能必須由獨立後端提供。

後端部署於使用者自己的 Linux Server：

```text
GitHub Pages Frontend
        ↓ HTTPS API
Linux Backend
        ↓
Prompt Coach
        ↓
Codex CLI
```

前端不得直接：

- SSH Linux Server
- 呼叫 CLI
- 暴露 API Key
- 暴露任何 Server Credential

只有 Prompt Coach 會透過 Backend API 呼叫模型。程式生成與 Debug 由學生自行使用外部生成式 AI，網站不得代為呼叫。

第一版 Prompt Coach 所使用的模型固定為：

```text
GPT-5.4 mini
Model ID: gpt-5.4-mini
```

模型必須由後端設定，前端與學生輸入不得覆寫模型名稱。

---

## 3.3 建議網路形式

例如：

```text
Frontend
https://<username>.github.io/arduino-ai-lab/

Backend
https://api.example.com/
```

或：

```text
Frontend
https://arduino.example.com/

Backend
https://arduino-api.example.com/
```

後端需：

- HTTPS
- CORS 僅允許指定前端 Origin
- Rate Limit
- Request Size Limit
- Timeout
- Input Validation

### 3.3.1 Linux 主機沒有固定 IP 的處理

Linux 主機沒有固定 IP 不影響本機開發，但若要讓 GitHub Pages 上的學生前端連入，後端仍必須具有：

- 穩定的公開 HTTPS 網址
- 可持續連線的網路
- 正確的 DNS 與 TLS 憑證
- 課前完成的外部連線與同時存取測試

第一版建議使用 **Cloudflare Tunnel + 固定子網域**，由 Linux 主機主動建立對外連線，將例如 `https://arduino-api.example.com/` 導向本機 Backend。此方式不需要固定公開 IP，也不需要直接對外開放 Backend Port。

參考：[Cloudflare Tunnel 官方文件](https://developers.cloudflare.com/tunnel/)

替代方案為 DDNS + Router Port Forwarding + Reverse Proxy + HTTPS，但需處理動態 IP 更新、NAT / CGNAT、路由器設定與防火牆，課堂使用的維運風險較高。

不得把臨時 IP 位址或會變動的 Tunnel URL 寫死在 production frontend；`VITE_API_BASE_URL` 應使用固定 HTTPS 網域。

---

# 4. 建議技術棧

## 4.1 Frontend

建議：

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Zustand 或 React Context（若狀態需求簡單可不用額外 state library）
- Zod（資料驗證）
- React Markdown 或 equivalent（教材 Markdown rendering）

理由：

- 容易靜態 build
- 適合 GitHub Pages
- TypeScript 有利資料模型維護
- 未來可持續增加課程

---

## 4.2 Backend

建議：

- Node.js
- TypeScript
- Fastify 或 Express
- Zod
- child_process / execa 呼叫 CLI
- JSON structured output

若目前既有 Linux AI Agent 專案已有可重用架構，可沿用，但 API contract 必須依本文件實作。

---

# 5. Repository 建議結構

若前後端同 Repo：

```text
arduino-ai-lab/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── types/
│       ├── schemas/
│       └── prompt/
│
├── content/
│   └── courses/
│       └── arduino-ai-intro/
│
├── docs/
│   ├── COURSE_PLAN.md
│   ├── DEVELOPMENT_PLAN.md
│   └── API.md
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
│
├── package.json
└── README.md
```

推薦使用 monorepo，但不要為了 monorepo 引入過度複雜工具。

可使用：

- npm workspaces
- pnpm workspaces

選一種即可。

---

# 6. 使用者角色

第一版只有：

## Student

學生可以：

- 開始課程
- 輸入暱稱或座號
- 完成關卡
- 填答
- 建立 Prompt
- 使用 AI
- Debug
- 查看自己的進度

第一版不需要：

- 完整教師登入系統
- RBAC
- 學校 SSO
- OAuth
- Email Login

---

# 7. 學生識別與匿名本機 Session

第一版採用「免帳密登入」的匿名本機 Session，不建立真正的帳號登入系統。

建議啟動課程時輸入：

```text
班級 / 組別（optional）
座號或代號
暱稱
```

網站建立匿名識別碼：

```ts
anonymousSessionId = crypto.randomUUID()
```

並存於：

```text
localStorage
```

建議 localStorage 保存：

- anonymousSessionId
- studentDisplayName
- studentCode
- courseProgress
- answers
- generatedPrompts
- currentLevel

這樣：

- 不需要帳號、密碼與登入流程
- 不需要在 Backend 建立學生個資資料庫
- 同一台電腦重新整理仍可繼續
- 降低 2 小時課堂的操作與帳號維護成本

限制：

- 進度只保留在相同電腦、相同瀏覽器與相同瀏覽器 Profile
- 換電腦、使用無痕模式，或學校在登出後自動清除瀏覽器資料時，進度無法延續
- `anonymousSessionId` 不是登入憑證，也不是 security boundary；不得用來授權敏感操作
- 若未來需要跨裝置續課、教師查看全班進度或長期成績紀錄，再於後續版本加入 Backend Database 與正式登入

需提供：

> 「清除本機學習紀錄」

功能。

---

# 8. 課程資料模型

課程內容不應全部 hardcode 在 React Component。

應資料驅動。

建議：

```ts
interface Course {
  id: string
  title: string
  description: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  title: string
  description?: string
  levels: Level[]
}

interface Level {
  id: string
  title: string
  summary?: string
  estimatedMinutes?: number

  content: ContentBlock[]
  exercises?: Exercise[]
  hardwareTask?: HardwareTask
  completionRule: CompletionRule
}
```

---

# 9. Content Block

教材頁需要支援多種 block。

建議：

```ts
type ContentBlock =
  | MarkdownBlock
  | CodeBlock
  | CalloutBlock
  | DiagramBlock
  | ImageBlock
  | QuestionBlock
  | HardwareInstructionBlock
```

例如：

```ts
interface CodeBlock {
  type: "code"
  language: "cpp" | "text" | "json"
  code: string
  title?: string
  highlightLines?: number[]
}
```

---

# 10. Exercise 資料模型

第一版至少支援：

## 10.1 Multiple Choice

```ts
interface MultipleChoiceExercise {
  type: "multiple-choice"
  id: string
  question: string
  options: {
    id: string
    label: string
  }[]
  correctOptionId: string
  explanation?: string
}
```

---

## 10.2 Fill Blank

```ts
interface FillBlankExercise {
  type: "fill-blank"
  id: string
  question: string
  acceptedAnswers: string[]
  explanation?: string
}
```

---

## 10.3 Prediction

例如：

> `delay(1000)` 改成 `delay(100)`，LED 會如何變化？

可使用 Multiple Choice 實作。

---

## 10.4 Reflection

無唯一答案，例如：

> 你觀察到遮住光敏電阻後，數值有什麼變化？

```ts
interface ReflectionExercise {
  type: "reflection"
  id: string
  question: string
  placeholder?: string
  minimumLength?: number
}
```

---

# 11. Hardware Task

網站需要明確提示學生何時切換到 Arduino IDE。

```ts
interface HardwareTask {
  title: string
  instructions: string[]
  expectedObservation?: string
  completionQuestion?: string
}
```

UI 建議明顯區分，例如：

> 🧪 現在換你實際操作 Arduino

並提供：

- 接線提示
- 程式碼
- Upload 指示
- 預期現象
- 「我完成了」按鈕

---

# 12. 第一章課程結構

## Chapter 1：Arduino 基礎程式設計

---

## Level 1-0：認識 Arduino

內容：

- Arduino UNO
- Arduino IDE
- Upload
- Digital / Analog
- Input / Process / Output 初步概念

不深入電子學。

---

## Level 1-1：程式怎麼運作？

核心：

```cpp
void setup() {}
void loop() {}
```

以及：

```cpp
digitalWrite()
delay()
```

實作：

> 修改板載 LED 閃爍速度。

---

## Level 1-2：變數

核心：

```cpp
int waitTime = 500;
```

實作：

> 使用 `waitTime` 控制 LED 閃爍。

---

## Level 1-3：讀取外面的世界

核心：

```cpp
analogRead(A0)
```

實作：

> 讀取光敏電阻。

---

## Level 1-4：看看 Arduino 看到了什麼

核心：

```cpp
Serial.begin(9600);
Serial.println(lightValue);
```

實作：

> 透過 Serial Monitor 觀察光線數值。

---

## Level 1-5：範圍轉換

核心：

```cpp
map()
```

實作：

```cpp
int angle = map(lightValue, 0, 1023, 0, 180);
```

先顯示：

```text
lightValue -> angle
```

不要立即操作 Servo。

---

## Level 1-6：控制 Servo

核心：

```cpp
#include <Servo.h>

Servo motor;
motor.attach(9);
motor.write(90);
```

實作：

```text
0° → 90° → 180°
```

---

## Level 1-Final：光控 Servo

整合：

```text
光線
 ↓
analogRead
 ↓
lightValue
 ↓
map
 ↓
angle
 ↓
motor.write
 ↓
Servo
```

學生需完成 Input / Process / Output 理解題。

---

# 13. 第二章課程結構

## Chapter 2：生成式 AI 協作開發

---

## Level 2-1：好的需求是什麼？

比較：

```text
幫我寫 Arduino 馬達程式
```

和：

```text
我使用 Arduino UNO + SG90...
```

讓學生理解完整 Context 的重要性。

---

## Level 2-2：五問需求拆解法

固定核心框架：

### 1. 我要做什麼？

Goal

### 2. 我有哪些東西？

Hardware / Resource

### 3. 我要怎麼控制？

Input / Control

### 4. 遇到不同情況，要怎麼做？

Logic / Behavior

### 5. 我要 AI 怎麼幫？

AI Role / Output

不同題目可動態調整，不要求所有題目固定五欄。

---

# 14. Prompt Builder

建立一個專用頁面。

學生看到：

```text
🎯 我要做什麼？
[textarea]

🧰 我有哪些材料？
[textarea / checkbox]

🎮 我要怎麼控制？
[textarea / select]

🧠 遇到不同情況要怎麼做？
[textarea]

🤖 我要 AI 怎麼幫？
[select]
```

AI Role 建議：

- 給我提示
- 一步一步教我
- 幫我寫完整程式
- 幫我解釋程式
- 幫我 Debug
- 幫我改善程式

---

# 15. Prompt Coach

Prompt Coach 是第一個 AI Layer。

它不能直接解 Arduino 題目。

## 15.1 職責

可以：

- 理解學生自然語言
- 將內容分類
- 修正文句
- 檢查資訊缺漏
- 產生 clarification
- 整理 structured requirement

不能：

- 自行增加硬體
- 自行增加 Pin
- 自行決定學生沒有說的行為
- 直接寫 Arduino Code
- 直接解題

---

# 16. Prompt Coach API

建議：

```http
POST /api/prompt/coach
```

Request：

```json
{
  "taskId": "servo-gate",
  "requirements": {
    "goal": "做一個柵欄",
    "hardware": ["Arduino UNO", "SG90"],
    "control": "用 Serial Monitor",
    "logic": [
      "OPEN 時打開",
      "CLOSE 時關閉"
    ],
    "aiHelp": "write-and-explain"
  }
}
```

Response 若資訊不足：

```json
{
  "complete": false,
  "missingFields": [
    {
      "field": "servoPin",
      "question": "SG90 的訊號線接在哪一個 Arduino 腳位？"
    }
  ],
  "structuredRequirement": {
    "goal": "製作可開關的柵欄",
    "hardware": [
      "Arduino UNO",
      "SG90"
    ],
    "control": "Serial Monitor",
    "logic": [
      "OPEN -> 開啟",
      "CLOSE -> 關閉"
    ]
  },
  "prompt": null
}
```

Response 完整：

```json
{
  "complete": true,
  "missingFields": [],
  "structuredRequirement": {
    "goal": "...",
    "hardware": ["..."],
    "control": "...",
    "logic": ["..."],
    "aiHelp": "..."
  },
  "prompt": "..."
}
```

---

# 17. Prompt 組裝策略

不要讓 LLM 完全自由產生 Prompt。

優先：

```text
LLM
 ↓
檢查 + 結構化
 ↓
Backend Template
 ↓
Final Prompt
```

而不是：

```text
Raw Student Input
 ↓
LLM 完全自由改寫
 ↓
Final Prompt
```

Template 建議：

```text
我正在進行一個 Arduino 專案。

【目標】
{{goal}}

【硬體】
{{hardware}}

【控制方式】
{{control}}

【控制邏輯】
{{logic}}

【需要 AI 協助】
{{aiHelp}}

我是 Arduino 初學者。
請使用容易理解的方式回答。

如果資訊不足，請先指出缺少的資訊，不要自行假設。
```

---

# 18. Prompt Preview

Prompt Coach 完成後，不應立刻送到外部生成式 AI。

先顯示：

## 我的原始想法

```text
做一個柵欄
Arduino + Servo
OPEN 開
CLOSE 關
```

## 整理後的需求

卡片呈現：

```text
目標
硬體
控制方式
控制邏輯
AI 任務
```

## 最終 Prompt

完整 Textarea / Code-like panel。

提供：

- 複製 Prompt
- 返回修改
- 前往「貼回外部 AI 程式碼」頁面

網站只負責複製 Prompt，不得代為呼叫程式生成模型、自動開啟帳號權限或代替學生登入第三方服務。

---

# 19. 外部 AI 程式碼貼回

網站不提供 Coding AI API。學生完成 Prompt 後：

1. 複製 Prompt 到自己使用的 Coding AI、Gemini、ChatGPT 或 Copilot。
2. 從外部 AI 取得 Arduino 程式碼。
3. 回到學習區貼上程式碼。
4. 網站以 `localStorage` 保存程式碼，接續 Arduino IDE 實測與 Debug 紀錄。

外部 AI 帳號、登入與使用量由學生選用的服務自行管理。

---

# 20. Token 使用政策

- Backend 只允許 Prompt Coach 呼叫 CodexProvider。
- 不提供 `/api/ai/code` 或 `/api/ai/debug`。
- Prompt Coach 先執行 deterministic validation；只有基本資料完整時才呼叫模型進行最後檢查。
- 開發、測試與 E2E 一律使用 Mock Prompt Coach，不得呼叫真實模型。

---

# 21. Debug Flow

學生貼回外部 AI 程式後，網站提供：

> 實際測試結果

選項：

- 完全成功
- 可以執行，但效果不符合需求
- Compile Error
- Upload 成功，但硬體沒有反應

若非成功，進入 Debug Form：

```text
發生什麼現象？
[textarea]

錯誤訊息：
[textarea]

目前接線：
[textarea]

我已經嘗試：
[textarea]
```

---

# 22. Debug Prompt

Debug 頁面在瀏覽器內將原始 Prompt、程式碼、問題現象、錯誤訊息、接線與已嘗試事項整理成可複製的 Debug Prompt，不呼叫 Backend。

網站同時提供固定檢查順序：

1. 辨識 Compile、Upload 或執行結果問題
2. 確認腳位、供電與共地
3. 確認 Arduino IDE 開發板與 Port
4. 使用最小測試程式分離問題
5. 每次只修改一項並記錄結果

---

# 23. 最終挑戰

題目：

## 智慧遮光板

提供：

- Arduino UNO
- 光敏電阻
- SG90 Servo

需求：

> 環境越亮，遮光板越關閉；環境越暗，遮光板越打開。

系統不直接提供完整程式。

學生必須：

```text
需求理解
 ↓
五問法
 ↓
Prompt Coach
 ↓
Prompt Preview
 ↓
外部生成式 AI
 ↓
貼回程式碼
 ↓
Arduino IDE
 ↓
UNO 測試
 ↓
Debug
```

---

# 24. UI / UX 規格

整體風格：

- 簡潔
- 清楚
- 適合國中生
- 不幼稚化
- 桌面優先，但需 responsive
- 學校電腦 1366×768 也需正常使用

避免：

- 過多動畫
- 過多遊戲化特效
- 複雜 Dashboard
- 大量 modal
- hidden navigation

---

# 25. Main Layout

Desktop：

```text
┌────────────────────────────────────────────┐
│ Arduino × AI Lab                進度 4/12 │
├──────────────┬─────────────────────────────┤
│              │                             │
│ 課程章節     │        Lesson Content       │
│              │                             │
│ 01 Arduino   │                             │
│ 02 Variables │                             │
│ 03 Sensor    │                             │
│ ...          │                             │
│              │                             │
├──────────────┴─────────────────────────────┤
│                         [上一頁] [下一頁] │
└────────────────────────────────────────────┘
```

---

# 26. 首頁

首頁包含：

- 課程名稱
- 2–3 句課程介紹
- 課程章節
- 預估時間：120 分鐘
- 使用器材
- 「開始上課」

第一次點開始：

```text
你的名字 / 暱稱
[          ]

座號或代號
[          ]

[開始]
```

---

# 27. Progress UI

應永遠讓學生知道：

- 現在在哪一章
- 現在第幾關
- 還剩多少

例如：

```text
第一章 Arduino 基礎
████████░░ 4 / 7
```

完成關卡：

```text
✓ 已完成
```

目前關卡：

```text
● 進行中
```

未解鎖：

```text
○ 尚未開始
```

---

# 28. 課程解鎖規則

第一版採線性解鎖：

```text
Level 1
 ↓
Level 2
 ↓
Level 3
```

完成當前 Level 的：

- 必答題
- 實作確認

後才能正式完成。

但可以允許教師透過 URL query 或 debug mode 解鎖全部，例如：

```text
?teacherMode=1
```

注意：

此功能只用於課堂操作方便，不視為真正 security boundary。

---

# 29. Persistence

第一版使用：

```text
localStorage
```

儲存：

```ts
interface StudentState {
  version: number
  student: {
    displayName: string
    studentCode?: string
  }

  courseId: string
  currentLevelId: string

  completedLevels: string[]

  answers: Record<string, unknown>

  promptHistory: PromptHistoryItem[]

  debugHistory: DebugHistoryItem[]
}
```

加上：

- schema version
- migration / reset strategy

---

# 30. 後端 AI Provider 抽象

不要將 Codex CLI 寫死在 business logic。

建立：

```ts
interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>
}
```

Provider：

```text
CodexProvider
AntigravityProvider
```

設定例如：

```env
PROMPT_COACH_PROVIDER=codex

CODEX_MODEL=gpt-5.4-mini
```

未來可以自由替換。

`CodexProvider` 呼叫 Codex CLI 時，模型必須由 Backend 的 allowlist 設定帶入，例如：

```bash
codex exec --model gpt-5.4-mini
```

不得接受前端傳入任意模型 ID 或 CLI argument。

截至 2026-08-11，GPT-5.4 mini 的 OpenAI API Model ID 為 `gpt-5.4-mini`。使用 ChatGPT 登入的 Codex 將於 2026-08-31 停用此模型，但 OpenAI API 與使用自有 API key 驗證的 Codex 不受該次停用影響。因此 Backend 應採自有 API key 驗證，並在正式上課前執行模型可用性 smoke test。

參考：[OpenAI GPT-5.4 mini 模型文件](https://developers.openai.com/api/docs/models/gpt-5.4-mini)

---

# 31. CLI 安全規格

非常重要：

AI CLI 執行時不得取得網站 Server 的任意檔案系統控制權。

AI Task 應：

- 使用固定 working directory
- 不允許學生控制 CLI argument
- 模型名稱只能取自 Backend allowlist，固定使用 `gpt-5.4-mini`
- 不允許學生傳 shell command
- 不把學生輸入直接拼接進 shell command
- 使用 stdin 或安全 API 傳 prompt
- 設 Timeout
- 設 maximum output
- 不允許 tool 去修改 Server 專案
- Prompt Coach 不應擁有 filesystem write 權限

若 CLI 支援 sandbox / read-only mode，應啟用。

---

# 32. API Security

至少實作：

- Helmet
- CORS allowlist
- Rate limit
- body size limit
- request timeout
- input Zod validation
- generic error response
- server-side logging

不要在 Response 洩漏：

- command
- server path
- API key
- stack trace
- system prompt
- environment variable

---

# 33. Rate Limiting

因為學生可能 20–40 人同時上課，AI endpoint 應能防止誤點與濫用。

建議：

```text
Prompt Coach：
10 requests / minute / anonymous session（無合法 session ID 時才 fallback IP）

Coding：
5 requests / minute / session

Debug：
5 requests / minute / session
```

實際限制可由 env 調整。

注意：學校電腦可能透過同一個 NAT 共用公開 IP。若全部 endpoint 只依 IP 限流，會把整班誤判為單一使用者。因此課堂 API 應優先使用格式合法的 `anonymousSessionId` 作為 rate-limit key，缺少時才使用 IP；此 ID 只用於流量分組，不是登入或授權憑證。全域資源保護仍由 concurrency limiter、request limit、timeout 與反向代理共同負責。

---

# 34. AI Concurrency

需考慮整班同時按下「問 AI」。

Backend 建議有簡單 queue。

例如：

```text
MAX_AI_CONCURRENCY=5
```

超出時：

```json
{
  "status": "queued",
  "message": "AI 正在處理其他同學的任務，請稍後再試。"
}
```

第一版若不做完整 Queue，可至少使用 concurrency limiter。

不要一次 spawn 30 個 CLI process。

---

# 35. API Error UX

學生不應看到技術錯誤。

例如 Backend timeout：

```text
AI 目前沒有成功回覆。

你填寫的資料不會消失，可以再次嘗試。
```

不要顯示：

```text
ECONNRESET
spawn codex ENOENT
HTTP 500
```

前端需保留學生已輸入內容。

---

# 36. GitHub Pages 部署

需建立：

```text
.github/workflows/deploy-pages.yml
```

需求：

- main branch push
- install dependencies
- typecheck
- test
- build
- deploy GitHub Pages

Vite 必須正確處理：

```ts
base
```

若 repo：

```text
github.com/user/arduino-ai-lab
```

Pages URL：

```text
https://user.github.io/arduino-ai-lab/
```

則 production base 應正確設定為：

```text
/arduino-ai-lab/
```

若未來使用 custom domain，也應容易調整。

---

# 37. SPA Routing

GitHub Pages 對 SPA history routing 有限制。

第一版優先：

- 使用 HashRouter

URL 例如：

```text
/#/course/arduino-ai-intro/level/1-3
```

理由：

- GitHub Pages 無需額外 404 hack
- 穩定
- 學校環境存取簡單

若確定要 clean URL 再另外處理。

---

# 38. Environment Variables

Frontend：

```env
VITE_API_BASE_URL=https://api.example.com
```

Backend：

```env
PORT=3000

FRONTEND_ORIGIN=https://username.github.io

PROMPT_COACH_PROVIDER=codex

CODEX_MODEL=gpt-5.4-mini

MAX_AI_CONCURRENCY=5

AI_REQUEST_TIMEOUT_MS=60000
```

Backend 另需以安全方式提供 `CODEX_API_KEY`；只注入 Codex CLI 子程序，不得寫入 Repository、回傳給前端或出現在 log。

Sensitive values 絕對不得進 frontend env。Backend 啟動時需驗證 `CODEX_MODEL` 必須存在於 allowlist，學生 Request 不得指定或覆寫模型。

---

# 39. Content Management

第一版不需要 Admin CMS。

課程內容直接以：

- TypeScript object
- JSON
- Markdown + metadata

存於 Repository。

推薦：

```text
content/courses/arduino-ai-intro/
├── course.ts
├── chapter-1/
│   ├── 1-0.md
│   ├── 1-1.md
│   └── ...
└── chapter-2/
```

程式題 metadata 可獨立放 JSON / TS。

---

# 40. 可維護性要求

禁止：

- 每一關寫成完全獨立 Page Component
- 重複大量 UI
- 課程資料寫死在 JSX
- Prompt Template 散落各 Component
- API URL hardcode
- AI Provider hardcode

應做到：

```text
Reusable Lesson Renderer
+
Course Data
```

---

# 41. Accessibility

至少：

- Button 可 keyboard 操作
- Form 有 label
- focus state
- 不只依靠顏色表示正確/錯誤
- Code font 足夠大
- 文字 contrast 足夠

---

# 42. Responsive

優先 Desktop：

```text
1366×768
1920×1080
```

也需要支援：

- Tablet
- 手機基本瀏覽

但不用將 mobile UX 做成第一優先。

---

# 43. Testing

至少實作：

## Unit Test

- Prompt template builder
- validation
- progress calculation
- localStorage schema

## API Test

- prompt coach validation
- invalid input
- provider timeout
- malformed provider response

## Frontend

至少測試核心流程：

```text
開始課程
→ 完成題目
→ 下一關
→ Prompt Builder
→ Preview
```

可使用 Vitest。

---

# 44. Mock AI Mode

非常重要。

開發時不能每次都真的呼叫 CLI。

支援：

```env
AI_PROVIDER=mock
```

Mock Provider 回傳固定結果。

例如：

```json
{
  "complete": true,
  "prompt": "Mock generated prompt"
}
```

並準備：

- successful code response
- incomplete requirement response
- debug response
- timeout simulation

---

# 45. Development Phases

## Phase 1：Frontend Skeleton

完成：

- Vite / React / TypeScript
- Routing
- Layout
- Course model
- LocalStorage
- Progress
- Mock course

完成標準：

> 可以純前端走完一個假課程。

---

## Phase 2：Arduino 第一章

完成：

- Chapter 1 全部教材
- Exercises
- Code Block
- Hardware Task
- Final Integration

完成標準：

> 學生可以從 Level 1-0 一路做到光控 Servo。

---

## Phase 3：Prompt Builder

完成：

- 五問 Form
- dynamic fields
- validation
- Preview UI
- Before / After

先使用 Mock Prompt Coach。

---

## Phase 4：Backend API

完成：

- Fastify / Express
- Zod
- CORS
- rate limit
- timeout
- health check
- AI Provider interface
- Mock Provider

Endpoint：

```text
GET  /health
POST /api/prompt/coach
```

---

## Phase 5：CLI Integration

完成：

- CodexProvider
- AntigravityProvider
- structured output parsing
- safe execution
- timeout
- concurrency limiter

---

## Phase 6：第二章 AI Flow

完成：

```text
Prompt Builder
→ Coach
→ Clarification
→ Preview
→ 外部生成式 AI
→ 貼回程式碼
→ Test Result
→ Debug
```

---

## Phase 7：GitHub Pages

完成：

- GitHub Actions
- GitHub Pages
- HashRouter
- production API URL
- README deployment guide

---

## Phase 8：Classroom Hardening

檢查：

- 30 students simultaneous access
- API error UX
- slow AI
- refresh page
- accidental reload
- localStorage
- school network restrictions
- 1366×768 display
- browser compatibility

---

# 46. MVP Definition

第一版 MVP 完成條件：

### Frontend

- GitHub Pages 可開啟
- 第一章完整
- 第二章完整
- Progress 可儲存
- Prompt Builder 可用
- Prompt Coach 回覆與外部 AI 程式碼貼回可用
- Debug flow 可用

### Backend

- HTTPS 可存取
- Prompt Coach
- Rate limit
- CLI timeout
- Provider abstraction

### Classroom

學生只需要：

1. 開啟網址
2. 輸入代號
3. 按照網站完成課程
4. 使用 Arduino IDE 完成硬體操作

不需要：

- GitHub 帳號
- 安裝 Node
- 登入網站或持有網站帳號
- 網站的 AI 帳號；學生使用外部 AI 時，是否需要登入由該服務決定
- SSH
- API Key

---

# 47. 第一版明確不做

避免 Scope Creep。

不做：

- 教師完整後台
- 學校帳號登入
- Google OAuth
- 即時多人系統
- 班級排行榜
- Arduino Web Serial
- Browser 直接 Upload Arduino
- Online Arduino compiler
- Cloud database
- AI 長期聊天記憶
- RAG
- Vector DB
- 課程 CMS
- 手機 App
- PWA
- 成績系統

除非後續明確提出需求。

---

# 48. Future Extensions

未來可能加入，但不在 MVP：

- 教師即時查看全班進度
- PostgreSQL / Supabase
- 班級 Session
- QR Code 快速加入
- Web Serial API
- Arduino compile server
- 多種 Arduino 課程
- ESP32
- PLC / IoT
- Prompt 學習分析
- AI 回答品質比較
- Codex vs Antigravity 比較模式
- 教師自訂任務

---

# 49. README 必須包含

README 至少說明：

## Development

```bash
npm install
npm run dev
```

## Frontend

```bash
npm run dev:web
```

## Backend

```bash
npm run dev:api
```

## Mock AI

如何啟用。

## Build

```bash
npm run build
```

## GitHub Pages

如何設定 Repo Pages。

## Backend Deployment

- env
- port
- reverse proxy
- HTTPS
- CORS

## AI Provider

如何選 Codex / Antigravity、如何設定 `CODEX_MODEL=gpt-5.4-mini`，以及正式上課前如何執行模型可用性 smoke test。

---

# 50. Codex 開發規則

請 Codex 開發時遵守：

1. 先閱讀整份本規格。
2. 先建立可運行 skeleton，再逐階段完成。
3. 每個 Phase 完成後執行 typecheck / test / build。
4. 不自行擴張 Scope。
5. 對未定義的 UX 採最簡單合理方案。
6. 所有課程內容資料驅動。
7. 所有 API 都需 schema validation。
8. 所有 AI Provider 都需透過 abstraction。
9. AI CLI 不得取得任意 filesystem / shell 控制能力。
10. 不把 secret 放進 GitHub Pages。
11. 確保 GitHub Pages production build 可正常開啟。
12. 最終提供清楚 README 與部署步驟。

---

# 51. 建議 Codex 實作順序

請依序：

```text
1. Initialize monorepo
2. Build shared types
3. Build course data model
4. Build frontend shell
5. Build lesson renderer
6. Build progress/localStorage
7. Implement Chapter 1
8. Implement Prompt Builder
9. Build backend skeleton
10. Build Mock Provider
11. Connect frontend/backend
12. Implement Prompt Coach
13. Implement external AI code paste-back
14. Implement local Debug Prompt flow
15. Implement CLI providers
16. Implement Chapter 2
17. Add tests
18. Add GitHub Pages workflow
19. Production build verification
20. README + deployment documentation
```

---

# 52. 最終驗收情境

完成後，以下流程必須可實際操作：

## Scenario A：Arduino 基礎

學生：

```text
進入網站
→ 學 setup / loop
→ 修改 Blink
→ 學變數
→ 讀取光敏電阻
→ Serial Monitor
→ map()
→ Servo
→ 完成光控 Servo
```

---

## Scenario B：Prompt Coach

學生輸入：

```text
我要做一個柵欄
有 Arduino UNO 和 SG90
用 Serial 控制
OPEN 打開
CLOSE 關閉
```

系統：

```text
結構化需求
→ 發現缺少 Servo Pin
→ 詢問學生
→ 學生補 D9
→ 產生完整 Prompt
```

---

## Scenario C：外部 AI 程式碼貼回

學生：

```text
確認 Prompt
→ 複製到外部 AI
→ 得到 Arduino Code
→ 貼回學習區
→ 進行實機測試
```

---

## Scenario D：Debug

學生回報：

```text
Compile 成功
但 Servo 不動
```

並輸入接線。

AI：

```text
先給檢查步驟
→ 不直接無腦重寫全部程式
```

---

## Scenario E：Reload

學生做到一半重新整理頁面。

結果：

```text
進度與答案仍保留
```

---

## Scenario F：GitHub Pages

一台全新的學校電腦：

```text
打開 Chrome / Edge
→ 輸入網站網址
→ 可以開始上課
```

無需登入 GitHub、無需安裝網站相關工具。

---

# 53. 最終架構摘要

```text
┌─────────────────────────────────────────────┐
│                GitHub Pages                 │
│                                             │
│ React / TypeScript Learning Website         │
│                                             │
│ Arduino Lesson                             │
│ Quiz                                       │
│ Progress                                   │
│ Prompt Builder                             │
│ Prompt Preview                             │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────┐
│               Linux Backend                 │
│                                             │
│ API                                         │
│ └── Prompt Coach                           │
│                                             │
│ Provider Layer                             │
│ ├── Codex CLI                              │
│ └── Antigravity CLI                        │
└─────────────────────────────────────────────┘
```

---

# 54. 專案成功標準

這個專案的成功不是「功能很多」，而是：

> 一位第一次接觸 Arduino 的國中生，只需要依照網站的引導，就能完成 Arduino 基礎學習、實體操作，並第一次正確體驗「整理需求 → 與 AI 協作 → 實際測試 → Debug」的完整開發流程。

系統設計應優先服務這個目標。
