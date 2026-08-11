import type { Course, Level } from "@arduino-ai/shared";

/** Information shown before a student starts an anonymous local session. */
export const arduinoAiIntroPresentation = {
  targetAudience: "國中生",
  durationNote: "課程內容 105 分鐘；開場與成果分享保留 15 分鐘，共 120 分鐘。",
  equipment: [
    "Arduino UNO",
    "SG90 伺服馬達",
    "光敏電阻與固定電阻（分壓電路）",
    "USB 傳輸線",
    "電腦、Arduino IDE 與 Serial Monitor",
  ],
} as const;

const level = (value: Level): Level => value;

export const arduinoAiIntroCourse = {
  id: "arduino-ai-intro",
  title: "Arduino × 生成式 AI 協作開發體驗課",
  description:
    "先讀懂 Arduino 的 Input → Process → Output，再把需求整理成 Prompt，與 AI 協作、實測並 Debug。",
  estimatedMinutes: 120,
  chapters: [
    {
      id: "chapter-1",
      title: "第一章：Arduino 基礎程式設計",
      description: "用 LED、光敏電阻與 Servo 建立 Input → Process → Output 的觀念。",
      levels: [
        level({
          id: "1-0",
          title: "1-0｜認識 Arduino",
          summary: "今天不是只學語法，而是用程式讓電子裝置感知並影響真實世界。",
          estimatedMinutes: 5,
          content: [
            {
              type: "markdown",
              content: `## 今天要完成什麼？

Arduino 是一塊可以讀取感測器、執行程式、控制輸出裝置的小電腦。今天我們會讓它讀取環境光線，再控制伺服馬達。`,
            },
            {
              type: "diagram",
              title: "真實世界到動作",
              content: `flowchart TD
  A[真實世界] --> B[感測器]
  B --> C[Arduino]
  C --> D[程式處理]
  D --> E[輸出裝置]`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "先記住三件事",
              content:
                "**Input（輸入）** 是感測器讀到的資料；**Process（處理）** 是程式做的判斷或計算；**Output（輸出）** 是 LED 或馬達做出的動作。",
            },
            {
              type: "markdown",
              content: `### 先認識桌上的工具

- **Arduino UNO**：執行程式。
- **USB**：把程式從電腦傳到 UNO，也供應基本電力。
- **Digital Pin**：輸出開／關，例如 LED。
- **Analog Pin**：讀取像光線這樣會慢慢改變的數值。
- **Arduino IDE**：編譯（檢查與翻譯）後 Upload（上傳）程式。`,
            },
            { type: "question", exerciseId: "1-0-ipo" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "1-0-ipo",
              question: "在「光敏電阻 → Arduino → Servo」中，Servo 最接近哪一種角色？",
              options: [
                { id: "input", label: "Input：讀取資料" },
                { id: "process", label: "Process：計算資料" },
                { id: "output", label: "Output：做出動作" },
              ],
              correctOptionId: "output",
              explanation: "Servo 接收 Arduino 的指令並轉動，所以它是輸出裝置。",
              required: true,
            },
          ],
          completionRule: { requiredExerciseIds: ["1-0-ipo"] },
        }),
        level({
          id: "1-1",
          title: "1-1｜程式怎麼運作？",
          summary: "理解 setup() 只執行一次，loop() 會重複執行。",
          estimatedMinutes: 8,
          content: [
            {
              type: "markdown",
              content: `## setup() 和 loop()

Arduino 開機後，會先跑一次 \`setup()\`，接著不斷重複跑 \`loop()\`。你可以把 \`setup()\` 想成上課前準備，把 \`loop()\` 想成一直重複做的工作。`,
            },
            {
              type: "code",
              language: "cpp",
              title: "Arduino 程式的基本外框",
              code: `void setup() {

}

void loop() {

}`,
            },
            {
              type: "diagram",
              title: "程式執行順序",
              content: `flowchart TD
  A[Arduino 開機] --> B[setup 執行一次]
  B --> C[loop]
  C --> D[loop]
  D --> E[loop]
  E --> C`,
            },
            {
              type: "code",
              language: "cpp",
              title: "板載 LED 每秒閃爍一次",
              highlightLines: [3, 7, 8, 10, 11],
              code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);

  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`,
            },
            {
              type: "callout",
              tone: "info",
              title: "這些語法在做什麼？",
              content:
                "`pinMode(..., OUTPUT)` 設定腳位要輸出；`digitalWrite(..., HIGH/LOW)` 讓 LED 亮／暗；`delay(1000)` 暫停 1000 毫秒，也就是 1 秒。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 實作：讓板載 LED 閃得更快",
              instructions: [
                "在 Arduino IDE 開啟或貼上範例程式。",
                "將兩個 delay(1000) 都改成 delay(100)。",
                "選擇正確的 UNO 板子與 Port，按 Upload。",
                "觀察 UNO 板上的內建 LED。",
              ],
              expectedObservation: "LED 會比原本每秒閃一次快很多，約每 0.1 秒切換亮暗。",
              completionQuestion: "你已經 Upload，並且看到 LED 變快了嗎？",
            },
            { type: "question", exerciseId: "1-1-delay" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "1-1-delay",
              question: "將 delay(1000) 改成 delay(100) 後，LED 會怎麼變化？",
              options: [
                { id: "slower", label: "閃得更慢" },
                { id: "faster", label: "閃得更快" },
                { id: "off", label: "永遠不會亮" },
              ],
              correctOptionId: "faster",
              explanation: "100 毫秒比 1000 毫秒短，所以程式更快切換 HIGH 與 LOW。",
              required: true,
            },
          ],
          hardwareTask: {
            title: "讓板載 LED 閃得更快",
            instructions: ["將兩個 delay(1000) 改為 delay(100) 並 Upload。"],
            expectedObservation: "LED 快速閃爍。",
            completionQuestion: "你已看到 LED 快速閃爍嗎？",
          },
          completionRule: { requiredExerciseIds: ["1-1-delay"], requiresHardwareConfirmation: true },
        }),
        level({
          id: "1-2",
          title: "1-2｜變數：幫資料取名字",
          summary: "變數用來記住資料，讓你只改一個地方就能調整程式。",
          estimatedMinutes: 6,
          content: [
            {
              type: "markdown",
              content: `## 讓數字有名字

\`int waitTime = 500;\` 可以讀成：「建立一個整數變數，名字叫 \`waitTime\`，現在存著 500。」不用先背完型別，只要知道變數能幫資料取容易理解的名字。`,
            },
            {
              type: "code",
              language: "cpp",
              title: "使用 waitTime 控制 LED",
              highlightLines: [1, 6, 9],
              code: `int waitTime = 500;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(waitTime);
  digitalWrite(LED_BUILTIN, LOW);
  delay(waitTime);
}`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "為什麼不直接寫數字？",
              content:
                "如果兩個地方都使用 `waitTime`，你只改第 1 行就能一起改變亮與暗的等待時間，不容易漏改。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 實作：調整自己的閃爍速度",
              instructions: [
                "把 waitTime 改成你想測試的整數，例如 200 或 800。",
                "Upload 後觀察 LED，再改一次比較。",
                "只改變數值，不要刪掉變數名稱。",
              ],
              expectedObservation: "數字小時 LED 閃得較快；數字大時 LED 閃得較慢。",
              completionQuestion: "你是否用 waitTime 成功改變閃爍速度？",
            },
            { type: "question", exerciseId: "1-2-variable" },
            { type: "question", exerciseId: "1-2-predict" },
          ],
          exercises: [
            {
              type: "fill-blank",
              id: "1-2-variable",
              question: "補上變數名稱：int ________ = 500;（用來控制等待時間）",
              acceptedAnswers: ["waitTime"],
              caseSensitive: true,
              explanation: "這一課使用 waitTime 作為等待時間的變數名稱。",
              required: true,
            },
            {
              type: "reflection",
              id: "1-2-predict",
              question: "如果 waitTime 從 500 改成 1000，你預測 LED 會如何改變？",
              placeholder: "請用一句話寫下你的預測。",
              minimumLength: 8,
              required: true,
            },
          ],
          hardwareTask: {
            title: "用變數控制 LED",
            instructions: ["至少測試兩個不同的 waitTime 數值並 Upload。"],
            expectedObservation: "waitTime 越大，亮和暗各等待越久。",
            completionQuestion: "你是否觀察到變數改變會影響 LED？",
          },
          completionRule: {
            requiredExerciseIds: ["1-2-variable", "1-2-predict"],
            requiresHardwareConfirmation: true,
          },
        }),
        level({
          id: "1-3",
          title: "1-3｜Arduino 怎麼感覺外面的世界？",
          summary: "用 analogRead(A0) 讀取光敏電阻，建立 Input 概念。",
          estimatedMinutes: 7,
          content: [
            {
              type: "markdown",
              content: `## 把光線變成數字

光敏電阻會隨光線改變電阻。它和固定電阻組成**分壓電路**後，Arduino 可以從 A0 讀到不同電壓，並換成 0 到 1023 的數值。現在不用計算電阻公式；先理解「真實世界會變成程式可處理的資料」。`,
            },
            {
              type: "code",
              language: "cpp",
              title: "讀取 A0 的數值",
              highlightLines: [1],
              code: `int lightValue = analogRead(A0);`,
            },
            {
              type: "diagram",
              title: "光線資料的路徑",
              content: `flowchart LR
  A[環境光線] --> B[光敏電阻]
  B --> C[A0]
  C --> D[analogRead]
  D --> E[lightValue 0 到 1023]`,
            },
            {
              type: "callout",
              tone: "warning",
              title: "接線前先確認",
              content:
                "裸光敏電阻不能只接一條線就讀值。請依教師提供的分壓接線圖接上固定電阻；不確定時先問老師，再接電源。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 實作：讀取光敏電阻",
              instructions: [
                "依教師示範完成光敏電阻與固定電阻的分壓電路。",
                "確認分壓中點接到 A0，UNO 仍以 USB 供電。",
                "先 Upload 下一關的 Serial Monitor 程式來觀察數值。",
              ],
              expectedObservation: "光線改變時，A0 讀到的數值會跟著改變。",
              completionQuestion: "你的光敏電阻分壓輸出是否接到 A0？",
            },
            { type: "question", exerciseId: "1-3-input" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "1-3-input",
              question: "analogRead(A0) 最主要是在做什麼？",
              options: [
                { id: "read", label: "讀取 A0 的類比數值" },
                { id: "move", label: "讓 Servo 轉到 A0 度" },
                { id: "print", label: "把 A0 顯示在螢幕上" },
              ],
              correctOptionId: "read",
              explanation: "analogRead 會讀取類比腳位的數值，還沒有控制任何輸出。",
              required: true,
            },
          ],
          hardwareTask: {
            title: "完成光敏電阻分壓接線",
            instructions: ["依教師的接線圖確認光敏電阻、固定電阻與 A0。"],
            expectedObservation: "改變光線會造成讀值改變。",
            completionQuestion: "你已確認 A0 的感測器接線嗎？",
          },
          completionRule: { requiredExerciseIds: ["1-3-input"], requiresHardwareConfirmation: true },
        }),
        level({
          id: "1-4",
          title: "1-4｜看看 Arduino 看到了什麼",
          summary: "使用 Serial Monitor 看見感測器資料，而不是猜測它是否有讀到。",
          estimatedMinutes: 7,
          content: [
            {
              type: "markdown",
              content: `## Arduino 不知道「亮」或「暗」

Arduino 真正讀到的是像 \`825\`、\`430\` 這樣的數字。Serial Monitor 是讓我們把數字從 UNO 顯示到電腦上的工具。`,
            },
            {
              type: "code",
              language: "cpp",
              title: "印出光敏電阻數值",
              highlightLines: [2, 7],
              code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int lightValue = analogRead(A0);
  Serial.println(lightValue);
  delay(100);
}`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "操作提醒",
              content:
                "Upload 完後再開啟 Tools → Serial Monitor，右下角 baud rate 要選 **9600**，才能和 `Serial.begin(9600)` 一致。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 實作：遮住與照亮感測器",
              instructions: [
                "Upload 程式後開啟 Serial Monitor，設定 9600 baud。",
                "先用手遮住光敏電阻，再放開並靠近燈光。",
                "觀察並記下至少兩種情況的數值。",
              ],
              expectedObservation: "數值會隨光線改變；哪個方向變大取決於實際分壓接法。",
              completionQuestion: "你是否在 Serial Monitor 看到會改變的數字？",
            },
            { type: "question", exerciseId: "1-4-serial" },
            { type: "question", exerciseId: "1-4-observe" },
          ],
          exercises: [
            {
              type: "fill-blank",
              id: "1-4-serial",
              question: "補上啟動 Serial Monitor 的程式：Serial.begin(____);",
              acceptedAnswers: ["9600"],
              explanation: "本課程程式用 9600 baud 與 Serial Monitor 溝通。",
              required: true,
            },
            {
              type: "reflection",
              id: "1-4-observe",
              question: "遮住光敏電阻與照到光時，你觀察到數值如何改變？",
              placeholder: "可寫「遮住時約 ___，照光時約 ___」。每組接線方向可能不同。",
              minimumLength: 12,
              required: true,
            },
          ],
          hardwareTask: {
            title: "用 Serial Monitor 觀察光線數值",
            instructions: ["設定 9600 baud，遮住／照亮感測器並觀察。"],
            expectedObservation: "連續顯示且會改變的整數。",
            completionQuestion: "你是否已實際看到改變的數值？",
          },
          completionRule: {
            requiredExerciseIds: ["1-4-serial", "1-4-observe"],
            requiresHardwareConfirmation: true,
          },
        }),
        level({
          id: "1-5",
          title: "1-5｜把一種數值變成另一種",
          summary: "用 map() 將 0–1023 的感測值轉換成 0–180 的 Servo 角度。",
          estimatedMinutes: 7,
          content: [
            {
              type: "markdown",
              content: `## 範圍不同，要先轉換

光敏電阻讀值通常在 0–1023；Servo 的目標角度使用 0–180。\`map()\` 可以把一個範圍中的位置，對應到另一個範圍中的位置。`,
            },
            {
              type: "diagram",
              title: "map 的範圍轉換",
              content: `flowchart LR
  A[lightValue\n0 到 1023] --> B[map]
  B --> C[angle\n0 到 180]`,
            },
            {
              type: "code",
              language: "cpp",
              title: "把光線讀值換成角度",
              code: `int angle = map(lightValue, 0, 1023, 0, 180);`,
            },
            {
              type: "code",
              language: "cpp",
              title: "先只印出轉換結果",
              code: `Serial.print(lightValue);
Serial.print(" -> ");
Serial.println(angle);`,
            },
            {
              type: "callout",
              tone: "important",
              title: "先確認資料，再控制馬達",
              content:
                "這一關只看 `lightValue -> angle`，暫時不接 Servo。先確認 Process 做對了，下一關才加 Output。",
            },
            { type: "question", exerciseId: "1-5-map" },
            { type: "question", exerciseId: "1-5-middle" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "1-5-map",
              question: "map(lightValue, 0, 1023, 0, 180) 的目的為何？",
              options: [
                { id: "range", label: "把光線讀值轉成 Servo 可以使用的角度範圍" },
                { id: "save", label: "把數值永久存到 Arduino" },
                { id: "upload", label: "把程式上傳到 UNO" },
              ],
              correctOptionId: "range",
              explanation: "map 負責範圍轉換，是 Input 到 Output 之間的 Process。",
              required: true,
            },
            {
              type: "fill-blank",
              id: "1-5-middle",
              question: "當 lightValue 接近 512 時，angle 約接近幾度？",
              acceptedAnswers: ["90", "90度", "90°"],
              explanation: "512 大約在 0–1023 的中間，所以會對應到 0–180 的中間，約 90°。",
              required: true,
            },
          ],
          completionRule: { requiredExerciseIds: ["1-5-map", "1-5-middle"] },
        }),
        level({
          id: "1-6",
          title: "1-6｜讓 Arduino 控制現實世界",
          summary: "使用 Servo Library、attach() 與 write() 控制 SG90 的角度。",
          estimatedMinutes: 7,
          content: [
            {
              type: "markdown",
              content: `## 控制 SG90 Servo

這一關不需要先理解 Class 或 Object。先把 \`Servo motor;\` 想成：建立一個名字叫 \`motor\` 的伺服馬達控制工具。`,
            },
            {
              type: "code",
              language: "cpp",
              title: "Servo 的三個重點",
              highlightLines: [1, 3, 7],
              code: `#include <Servo.h>

Servo motor;

void setup() {
  motor.attach(9);
  motor.write(90);
}

void loop() {
}`,
            },
            {
              type: "callout",
              tone: "warning",
              title: "電力與接線安全",
              content:
                "先依教師提供的 SG90 接線圖確認訊號、5V、GND。Servo 卡住、過熱或電腦 USB 不穩時，立刻停止並請老師協助；不要硬轉馬達軸。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 實作：0° → 90° → 180°",
              instructions: [
                "確認 SG90 訊號線接到本範例使用的 D9。",
                "依序將 motor.write(0)、motor.write(90)、motor.write(180) Upload 測試。",
                "若角度接近極限時卡住，改用安全角度範圍並告知老師。",
              ],
              expectedObservation: "Servo 會依程式移動到接近指定角度。",
              completionQuestion: "你是否看到 Servo 依指令改變位置？",
            },
            { type: "question", exerciseId: "1-6-write" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "1-6-write",
              question: "motor.write(90) 會做什麼？",
              options: [
                { id: "angle", label: "讓 motor 嘗試移動到 90°" },
                { id: "read", label: "讀取第 90 個感測器數值" },
                { id: "wait", label: "等待 90 秒" },
              ],
              correctOptionId: "angle",
              explanation: "write 的參數是 Servo 的目標角度。",
              required: true,
            },
          ],
          hardwareTask: {
            title: "控制 Servo 三個角度",
            instructions: ["確認接線後，測試 0、90、180 度（必要時避開極限）。"],
            expectedObservation: "Servo 會隨指令轉動。",
            completionQuestion: "你是否已觀察到 Servo 動作？",
          },
          completionRule: { requiredExerciseIds: ["1-6-write"], requiresHardwareConfirmation: true },
        }),
        level({
          id: "1-final",
          title: "1-Final｜光控伺服馬達",
          summary: "整合 analogRead、map、motor.write，完成第一章的 Input → Process → Output。",
          estimatedMinutes: 13,
          content: [
            {
              type: "markdown",
              content: `## 第一章整合：讓光線控制 Servo

現在把前面做過的事放在一起：讀光敏電阻、把範圍換成角度、再讓 Servo 轉動。請先讀程式，再實機測試。`,
            },
            {
              type: "diagram",
              title: "完整的 Input → Process → Output",
              content: `flowchart TD
  A[光敏電阻] --> B[analogRead]
  B --> C[lightValue]
  C --> D[map]
  D --> E[angle]
  E --> F[motor.write]
  F --> G[Servo 馬達]`,
            },
            {
              type: "code",
              language: "cpp",
              title: "光控 Servo 完整範例",
              highlightLines: [8, 10, 12],
              code: `#include <Servo.h>

Servo motor;
int lightPin = A0;
int servoPin = 9;

void setup() {
  Serial.begin(9600);
  motor.attach(servoPin);
}

void loop() {
  int lightValue = analogRead(lightPin);
  int angle = map(lightValue, 0, 1023, 0, 180);
  motor.write(angle);

  Serial.print(lightValue);
  Serial.print(" -> ");
  Serial.println(angle);
  delay(100);
}`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "如果方向和你預期相反",
              content:
                "先在 Serial Monitor 確認亮與暗時數值的方向。若教師同意，可將 `map(lightValue, 0, 1023, 0, 180)` 的最後兩個數字對調為 `180, 0`，但要先說明為什麼。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 第一章實機驗證",
              instructions: [
                "確認 A0、Servo 訊號 D9、5V、GND 接線。",
                "Upload 完整程式後開啟 Serial Monitor（9600 baud）。",
                "改變感測器的光線，觀察 lightValue、angle 與 Servo 動作。",
                "若馬達方向不符合想像，先記錄數值與現象，不要直接亂改多行程式。",
              ],
              expectedObservation: "光線改變時，數字與 Servo 角度都會改變。",
              completionQuestion: "你是否同時看到數字改變與 Servo 動作？",
            },
            { type: "question", exerciseId: "1-final-input" },
            { type: "question", exerciseId: "1-final-process" },
            { type: "question", exerciseId: "1-final-output" },
            { type: "question", exerciseId: "1-final-reflect" },
          ],
          exercises: [
            {
              type: "fill-blank",
              id: "1-final-input",
              question: "哪個函式負責 Input（讀取光線）？",
              acceptedAnswers: ["analogRead", "analogRead()", "analogRead(A0)"],
              explanation: "analogRead 從 A0 讀取光敏電阻的資料。",
              required: true,
            },
            {
              type: "fill-blank",
              id: "1-final-process",
              question: "哪個函式負責把 lightValue 轉換成 angle？",
              acceptedAnswers: ["map", "map()"],
              explanation: "map 將 0–1023 的輸入範圍轉成 0–180 的角度範圍。",
              required: true,
            },
            {
              type: "fill-blank",
              id: "1-final-output",
              question: "哪一行負責讓 Servo 實際動作？",
              acceptedAnswers: ["motor.write(angle)", "motor.write(angle);"],
              explanation: "motor.write(angle) 將計算出的角度送到 Servo。",
              required: true,
            },
            {
              type: "reflection",
              id: "1-final-reflect",
              question: "用自己的話描述這份程式的 Input、Process、Output 各是什麼。",
              placeholder: "Input 是…；Process 是…；Output 是…",
              minimumLength: 24,
              required: true,
            },
          ],
          hardwareTask: {
            title: "完成光控 Servo",
            instructions: ["Upload、觀察 Serial Monitor，改變光線並確認 Servo 會動。"],
            expectedObservation: "光線數值、角度與 Servo 動作連動。",
            completionQuestion: "你是否完成光控 Servo 的實機驗證？",
          },
          completionRule: {
            requiredExerciseIds: [
              "1-final-input",
              "1-final-process",
              "1-final-output",
              "1-final-reflect",
            ],
            requiresHardwareConfirmation: true,
          },
        }),
      ],
    },
    {
      id: "chapter-2",
      title: "第二章：生成式 AI 協作開發",
      description: "先說清楚需求，再讓 AI 協助產生、測試與修正 Arduino 程式。",
      levels: [
        level({
          id: "2-1",
          title: "2-1｜為什麼 AI 需要清楚的需求？",
          summary: "比較模糊與完整 Prompt，理解 Context 的重要性。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## AI 不會讀心

比較下面兩個 Prompt。哪一個有硬體、接線、控制方式與動作規則？資訊越完整，AI 越不需要猜。`,
            },
            {
              type: "code",
              language: "text",
              title: "Prompt A：太模糊",
              code: "幫我寫 Arduino 馬達程式",
            },
            {
              type: "code",
              language: "text",
              title: "Prompt B：有 Context",
              code: `我使用 Arduino UNO 和 SG90。
Servo 訊號接在 D9。
我希望輸入 OPEN 時 Servo 到 90 度，輸入 CLOSE 時回到 0 度。
請產生 Arduino 程式並解釋。`,
            },
            {
              type: "callout",
              tone: "important",
              title: "AI 協作的第一步",
              content:
                "不是立刻問「幫我寫」，而是先把自己知道的需求說清楚。AI 不知道的資訊，應由人補上，而不是叫 AI 自己猜。",
            },
            { type: "question", exerciseId: "2-1-context" },
            { type: "question", exerciseId: "2-1-reason" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-1-context",
              question: "哪一個 Prompt 較容易讓 AI 寫出符合需求的程式？",
              options: [
                { id: "a", label: "Prompt A" },
                { id: "b", label: "Prompt B" },
                { id: "same", label: "兩個一樣" },
              ],
              correctOptionId: "b",
              explanation: "Prompt B 說明硬體、腳位、輸入、動作與需要的協助。",
              required: true,
            },
            {
              type: "reflection",
              id: "2-1-reason",
              question: "寫出 Prompt B 比 A 多提供的一項重要資訊，以及它為什麼有用。",
              placeholder: "例如：它寫了 Servo 接 D9，所以 AI 不必猜腳位。",
              minimumLength: 16,
              required: true,
            },
          ],
          completionRule: { requiredExerciseIds: ["2-1-context", "2-1-reason"] },
        }),
        level({
          id: "2-2",
          title: "2-2｜五問需求拆解法",
          summary: "用 Goal、Hardware、Control、Logic、AI Help 把想法拆開。",
          estimatedMinutes: 5,
          content: [
            {
              type: "markdown",
              content: `## 五問需求拆解法

1. **我要做什麼？**（Goal）
2. **我有哪些東西？**（Hardware / Resource）
3. **我要怎麼控制？**（Input / Control）
4. **遇到不同情況，要怎麼做？**（Logic / Behavior）
5. **我要 AI 怎麼幫？**（AI Role / Output）`,
            },
            {
              type: "diagram",
              title: "從想法到 Prompt",
              content: `flowchart LR
  A[模糊想法] --> B[五問拆解]
  B --> C[結構化需求]
  C --> D[完整 Prompt]
  D --> E[AI 協作]`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "不是每題都要硬填五格",
              content:
                "五問是思考工具。不同任務可以調整欄位，但只要是 AI 不該猜的資訊，就應該說清楚。",
            },
            {
              type: "question",
              exerciseId: "2-2-logic",
            },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-2-logic",
              question: "「OPEN 時 Servo 到 90°；CLOSE 時回到 0°」最屬於五問中的哪一項？",
              options: [
                { id: "goal", label: "我要做什麼？" },
                { id: "hardware", label: "我有哪些東西？" },
                { id: "logic", label: "遇到不同情況，要怎麼做？" },
              ],
              correctOptionId: "logic",
              explanation: "它描述不同輸入情況下，作品要做出的行為。",
              required: true,
            },
          ],
          activities: [
            {
              id: "2-2:prompt-builder",
              type: "prompt-builder",
              title: "填寫 Serial 控制小柵欄的五問需求",
              description: "完成 servo-gate 的必填欄位，再送出給 Prompt Coach。",
              taskId: "servo-gate",
            },
          ],
          completionRule: {
            requiredExerciseIds: ["2-2-logic"],
            requiredActivityIds: ["2-2:prompt-builder"],
          },
        }),
        level({
          id: "2-3",
          title: "2-3｜Prompt Coach",
          summary: "Prompt Coach 只整理需求與指出缺漏，不直接替你完成 Arduino 題目。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## 需求整理助手，不是解題 AI

網站把你填的資料送給 Prompt Coach。它可以整理語句、分類資訊、檢查缺漏，卻不能自己增加你的硬體、腳位或控制規則，也不直接產生 Arduino 程式。`,
            },
            {
              type: "diagram",
              title: "Prompt Coach 的工作",
              content: `flowchart LR
  A[學生需求] --> B[檢查缺漏]
  B --> C[結構化需求]
  C --> D[Prompt 預覽]
  B --> E[需要補充的問題]`,
            },
            {
              type: "callout",
              tone: "warning",
              title: "不要讓 AI 猜接線",
              content:
                "如果你沒說 Servo 接哪一腳，Coach 應該問你，而不是隨便選 D9。請根據真正接線回答。",
            },
            { type: "question", exerciseId: "2-3-role" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-3-role",
              question: "Prompt Coach 發現缺少 Servo 腳位時，最合適的做法是？",
              options: [
                { id: "ask", label: "詢問學生實際接在哪一腳" },
                { id: "guess", label: "自行猜 D9" },
                { id: "code", label: "直接寫完整程式" },
              ],
              correctOptionId: "ask",
              explanation: "接線是事實資訊，AI 不應自行假設。",
              required: true,
            },
          ],
          activities: [
            {
              id: "2-3:prompt-coach",
              type: "prompt-coach",
              title: "送出需求給 Prompt Coach",
              description: "閱讀整理後的需求，並處理系統提出的問題。",
              taskId: "servo-gate",
            },
          ],
          completionRule: {
            requiredExerciseIds: ["2-3-role"],
            requiredActivityIds: ["2-3:prompt-coach"],
          },
        }),
        level({
          id: "2-4",
          title: "2-4｜需求不完整怎麼辦？",
          summary: "面對 clarification 時，補充事實資訊而不是要求 AI 亂猜。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## 需求少了什麼？

如果只輸入「我要讓 Servo 動」，AI 不知道你有哪一塊板子、訊號接哪裡、要自動來回還是根據光線變化。這時被問問題是正常的開發過程。`,
            },
            {
              type: "code",
              language: "text",
              title: "Prompt Coach 的澄清問題示例",
              code: `你的需求還少了一些資訊：
SG90 的訊號線接在哪一個 Arduino 腳位？
請依照實際接線回答，例如 D9。`,
            },
            {
              type: "callout",
              tone: "success",
              title: "澄清後才會更可靠",
              content:
                "你補上 D9 後，系統才能把「Servo 訊號線接在 D9」放進最終 Prompt。這是人和 AI 共同完成需求，而不是 AI 自己猜對。",
            },
            { type: "question", exerciseId: "2-4-clarify" },
          ],
          exercises: [
            {
              type: "fill-blank",
              id: "2-4-clarify",
              question: "若你的 Servo 訊號線真的接在 D9，請填入：Servo 訊號線接在 ____。",
              acceptedAnswers: ["D9", "d9"],
              caseSensitive: false,
              explanation: "要依實際接線填寫；本練習例子使用 D9。",
              required: true,
            },
          ],
          completionRule: { requiredExerciseIds: ["2-4-clarify"] },
        }),
        level({
          id: "2-5",
          title: "2-5｜產生完整 Prompt",
          summary: "先看 Before / After，確認整理後需求正確，才選擇要交給哪一種 AI。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## 先確認，再送出

預覽頁會同時顯示你的原始想法、整理後的需求與最終 Prompt。請檢查其中的硬體、腳位和行為是否真的是你要的。`,
            },
            {
              type: "code",
              language: "text",
              title: "完整 Prompt 的必要內容",
              code: `【目標】做一個可開關的簡易柵欄
【硬體】Arduino UNO、SG90 Servo
【控制方式】Serial Monitor 輸入 OPEN / CLOSE
【控制邏輯】OPEN → 90°；CLOSE → 0°
【接線】Servo 訊號線接 D9
【需要 AI 協助】請產生初學者可讀的程式並解釋`,
            },
            {
              type: "callout",
              tone: "important",
              title: "你有兩條可用路徑",
              content:
                "可按「使用網站內建 Coding AI」，或按「複製 Prompt」後貼到你自己的 Coding AI、Gemini、ChatGPT、Copilot 等生成式 AI 對話。外部 AI 的登入與帳號由該服務決定，網站不會替你登入。",
            },
            { type: "question", exerciseId: "2-5-preview" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-5-preview",
              question: "在把 Prompt 送給 Coding AI 前，最重要要檢查什麼？",
              options: [
                { id: "facts", label: "硬體、腳位、控制邏輯是否是自己的真實需求" },
                { id: "emoji", label: "Prompt 裡有沒有表情符號" },
                { id: "long", label: "Prompt 是否越長越好" },
              ],
              correctOptionId: "facts",
              explanation: "完整不等於字多；事實正確、行為清楚才是重點。",
              required: true,
            },
          ],
          activities: [
            {
              id: "2-5:prompt-preview",
              type: "prompt-preview",
              title: "確認並選擇 AI 使用路徑",
              description: "確認 Before / After 後，可複製 Prompt 或準備使用網站內建 Coding AI。",
              taskId: "servo-gate",
            },
          ],
          completionRule: {
            requiredExerciseIds: ["2-5-preview"],
            requiredActivityIds: ["2-5:prompt-preview"],
          },
        }),
        level({
          id: "2-6",
          title: "2-6｜測試 AI 的程式",
          summary: "AI 回答不是完成；要讀程式、Upload、觀察結果並記錄。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## 收到 AI 程式後要做什麼？

先閱讀 AI 的程式，確認你看得懂它用了什麼腳位與規則。然後貼到 Arduino IDE、Upload，最後用真正的硬體測試。`,
            },
            {
              type: "diagram",
              title: "AI 協作不是一次就結束",
              content: `flowchart LR
  A[AI 程式] --> B[閱讀]
  B --> C[Upload]
  C --> D[實機測試]
  D --> E{符合需求？}
  E -->|是| F[記錄成功]
  E -->|否| G[記錄問題並 Debug]`,
            },
            {
              type: "callout",
              tone: "warning",
              title: "不要只看畫面上的程式碼",
              content:
                "程式能不能編譯、接線是否正確、Servo 是否真的有動，都必須在 UNO 上驗證。請保留你測試時看到的現象與錯誤訊息。",
            },
            { type: "question", exerciseId: "2-6-test" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-6-test",
              question: "AI 產生程式後，下一個最合適的步驟是？",
              options: [
                { id: "test", label: "閱讀、Upload，並實機測試" },
                { id: "submit", label: "直接宣布作品完成" },
                { id: "delete", label: "立刻刪掉程式" },
              ],
              correctOptionId: "test",
              explanation: "AI 回答需要透過實測驗證，不能只假設它正確。",
              required: true,
            },
          ],
          activities: [
            {
              id: "2-6:coding-ai",
              type: "coding-ai",
              title: "取得 Arduino 程式與初學者解釋",
              description: "使用網站內建 AI，或在外部 AI 取得回覆後貼回／記錄程式。",
              taskId: "servo-gate",
            },
            {
              id: "2-6:test-result",
              type: "test-result",
              title: "記錄第一次實測結果",
              description: "選擇完全成功、效果不符、Compile Error 或 Upload 成功但硬體無反應。",
              taskId: "servo-gate",
            },
          ],
          completionRule: {
            requiredExerciseIds: ["2-6-test"],
            requiredActivityIds: ["2-6:coding-ai", "2-6:test-result"],
          },
        }),
        level({
          id: "2-7",
          title: "2-7｜Debug 也是 AI 協作",
          summary: "回報現象、錯誤訊息、接線與已嘗試事項，讓 AI 協助安排檢查順序。",
          estimatedMinutes: 4,
          content: [
            {
              type: "markdown",
              content: `## 失敗不是結束，是新資訊

如果效果不符合需求，不要只說「不能動」。請描述**實際現象**、貼上**錯誤訊息**、寫下**接線狀態**與**已嘗試的事**。`,
            },
            {
              type: "code",
              language: "text",
              title: "好的 Debug 回報範例",
              code: `現象：Compile 成功、Upload 成功，但 Servo 不動。
錯誤訊息：沒有。
實際接線：棕線 GND、紅線 5V、橘線 D9。
已嘗試：重新 Upload，並確認 Serial Monitor 有收到 OPEN。`,
            },
            {
              type: "callout",
              tone: "tip",
              title: "好的 Debug AI 會先做什麼？",
              content:
                "它應先列出 3–5 個最可能原因與檢查順序，例如確認 Servo 電源／共地、訊號腳位、指令格式；不應不看問題就整份重寫程式。",
            },
            { type: "question", exerciseId: "2-7-debug" },
          ],
          exercises: [
            {
              type: "reflection",
              id: "2-7-debug",
              question: "若 Servo 不動，你會先提供給 Debug AI 的兩項資訊是什麼？",
              placeholder: "例如：實際現象、接線、錯誤訊息、已嘗試事項。",
              minimumLength: 16,
              required: true,
            },
          ],
          activities: [
            {
              id: "2-7:debug-report",
              type: "debug-report",
              title: "送出一份可重現的 Debug 回報",
              description: "完成現象、錯誤訊息、接線與已嘗試事項，閱讀 AI 的檢查順序。",
              taskId: "servo-gate",
            },
          ],
          completionRule: {
            requiredExerciseIds: ["2-7-debug"],
            requiredActivityIds: ["2-7:debug-report"],
          },
        }),
        level({
          id: "2-final",
          title: "2-Final｜智慧遮光板 AI 協作挑戰",
          summary: "自行定義亮暗邏輯，完整走過需求、Prompt、AI、實測與修正流程。",
          estimatedMinutes: 16,
          content: [
            {
              type: "markdown",
              content: `## 挑戰：智慧遮光板

桌上有 Arduino UNO、光敏電阻與 SG90 Servo。需求是：**環境越亮，遮光板越關閉；環境越暗，遮光板越打開。**

這次老師不會直接給完整程式。你要用第一章的 Input → Process → Output，和第二章的五問法來完成。`,
            },
            {
              type: "diagram",
              title: "最終挑戰流程",
              content: `flowchart TD
  A[理解亮暗需求] --> B[五問需求拆解]
  B --> C[Prompt Coach]
  C --> D[確認 Prompt]
  D --> E[Coding AI]
  E --> F[Arduino IDE 與 UNO 測試]
  F --> G{符合需求？}
  G -->|否| H[Debug]
  H --> F
  G -->|是| I[成果展示]`,
            },
            {
              type: "callout",
              tone: "important",
              title: "請先做一個方向決定",
              content:
                "先用 Serial Monitor 看亮與暗時 `lightValue` 的方向，再決定 map 的最後兩個參數是否要用 `0, 180` 或 `180, 0`。請把理由寫進 Logic，不要憑感覺猜。",
            },
            {
              type: "hardware-instruction",
              title: "🧪 最終實機測試",
              instructions: [
                "完成 smart-shade 五問需求，確認腳位與亮暗邏輯。",
                "讓 Prompt Coach 檢查，預覽最終 Prompt 後選擇內建或外部 Coding AI。",
                "把程式放入 Arduino IDE、Upload，改變光線測試遮光板。",
                "記錄完全成功或失敗現象；若失敗，使用 Debug Flow 後再測。",
              ],
              expectedObservation: "光線變亮與變暗時，Servo 會往你定義的開／關方向移動。",
              completionQuestion: "你是否已完成至少一次智慧遮光板實機測試？",
            },
            { type: "question", exerciseId: "2-final-ipo" },
            { type: "question", exerciseId: "2-final-reflect" },
          ],
          exercises: [
            {
              type: "multiple-choice",
              id: "2-final-ipo",
              question: "智慧遮光板中，哪一個組合正確描述 Input → Process → Output？",
              options: [
                {
                  id: "correct",
                  label: "analogRead 光線 → map 成角度 → motor.write 控制 Servo",
                },
                {
                  id: "reverse",
                  label: "motor.write 光線 → analogRead 成角度 → map 控制 Servo",
                },
                {
                  id: "only-ai",
                  label: "AI 回答 → 直接完成，不需要測試",
                },
              ],
              correctOptionId: "correct",
              explanation: "感測器先提供 Input，程式 map 處理，再由 Servo 做 Output。",
              required: true,
            },
            {
              type: "reflection",
              id: "2-final-reflect",
              question: "這次 AI 協作中，你做了哪一個人類不可省略的判斷或測試？為什麼？",
              placeholder: "例如：確認接線、決定亮暗方向、Upload 實測、記錄 Debug 現象。",
              minimumLength: 20,
              required: true,
            },
          ],
          activities: [
            {
              id: "2-final:prompt-builder",
              type: "prompt-builder",
              title: "填寫智慧遮光板需求",
              description: "完成 smart-shade 的 Goal、Hardware、Control、Logic、Servo 腳位與 AI Role。",
              taskId: "smart-shade",
            },
            {
              id: "2-final:prompt-coach",
              type: "prompt-coach",
              title: "處理智慧遮光板的需求檢查",
              description: "補齊 Coach 指出的事實資訊，不讓 AI 自行猜測。",
              taskId: "smart-shade",
            },
            {
              id: "2-final:prompt-preview",
              type: "prompt-preview",
              title: "確認最終 Prompt",
              description: "確認亮暗方向、硬體與腳位符合實際作品。",
              taskId: "smart-shade",
            },
            {
              id: "2-final:coding-ai",
              type: "coding-ai",
              title: "取得並閱讀 AI 程式",
              description: "使用內建 AI，或複製 Prompt 給外部生成式 AI。",
              taskId: "smart-shade",
            },
            {
              id: "2-final:test-result",
              type: "test-result",
              title: "記錄智慧遮光板測試結果",
              description: "在 Arduino UNO 上測試並記錄第一次結果。",
              taskId: "smart-shade",
            },
          ],
          hardwareTask: {
            title: "完成智慧遮光板實測",
            instructions: ["完成 AI 協作流程，Upload 並用光線實測；失敗時記錄可重現的現象。"],
            expectedObservation: "亮暗變化能依你定義的規則控制 Servo。",
            completionQuestion: "你是否已在 UNO 上實際測試智慧遮光板？",
          },
          completionRule: {
            requiredExerciseIds: ["2-final-ipo", "2-final-reflect"],
            requiresHardwareConfirmation: true,
            requiredActivityIds: [
              "2-final:prompt-builder",
              "2-final:prompt-coach",
              "2-final:prompt-preview",
              "2-final:coding-ai",
              "2-final:test-result",
            ],
          },
        }),
      ],
    },
  ],
} satisfies Course;

export const arduinoAiIntroActivityCompletionMessages: Record<string, string> = {
  "2-2:prompt-builder": "請先完成五問需求，才能送給 Prompt Coach。",
  "2-3:prompt-coach": "請送出需求並閱讀 Prompt Coach 的整理或澄清問題。",
  "2-5:prompt-preview": "請先確認整理後的需求與最終 Prompt。",
  "2-6:coding-ai": "請取得 Arduino 程式與解釋，再進行測試。",
  "2-6:test-result": "請記錄第一次實機測試的結果。",
  "2-7:debug-report": "請完成可重現的 Debug 回報。",
  "2-final:prompt-builder": "請先完成智慧遮光板的五問需求。",
  "2-final:prompt-coach": "請讓 Prompt Coach 檢查需求並補齊缺漏。",
  "2-final:prompt-preview": "請確認最終 Prompt 的亮暗邏輯、硬體與腳位。",
  "2-final:coding-ai": "請取得可閱讀的 Arduino 程式與解釋。",
  "2-final:test-result": "請在 UNO 上測試並記錄結果。",
};
