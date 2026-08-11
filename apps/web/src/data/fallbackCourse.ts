import type { Course, PromptTask } from '@arduino-ai/shared'

const blinkCode = `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`

const lightServoCode = `#include <Servo.h>

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
  Serial.println(angle);
  delay(100);
}`

export const fallbackCourse: Course = {
  id: 'arduino-ai-intro',
  title: 'Arduino × 生成式 AI 協作開發體驗課',
  description: '用 Arduino UNO 實際操作，從看懂程式到清楚地與 AI 協作完成作品。',
  estimatedMinutes: 120,
  chapters: [
    {
      id: 'arduino-basics',
      title: '第一章｜Arduino 基礎程式設計',
      description: '先建立 Input → Process → Output 的控制觀念。',
      levels: [
        {
          id: '1-0', title: '認識 Arduino', summary: '認識 UNO、Arduino IDE 與 Upload。', estimatedMinutes: 5,
          content: [
            { type: 'markdown', content: '今天不是只學程式語法，而是用程式讓電子裝置**感知**並**影響**真實世界。Arduino UNO 會讀取感測器，再控制輸出裝置。' },
            { type: 'diagram', title: '今天的控制流程', content: '真實世界 → 感測器 → Arduino → 程式處理 → 輸出裝置' },
            { type: 'callout', tone: 'tip', title: '先記住', content: '網站負責幫你理解與記錄；Arduino UNO 負責實際驗證。' },
          ],
          exercises: [{ id: '1-0-ipo', type: 'multiple-choice', question: '哪一項是 Arduino 讀取光線的「輸入」？', options: [{ id: 'a', label: '光敏電阻' }, { id: 'b', label: 'SG90 伺服馬達' }, { id: 'c', label: 'Serial Monitor' }], correctOptionId: 'a', explanation: '光敏電阻將光線狀態轉成可讀取的電壓。', required: true }],
          completionRule: { requiredExerciseIds: ['1-0-ipo'] },
        },
        {
          id: '1-1', title: '程式怎麼運作？', summary: '認識 setup()、loop()、digitalWrite() 與 delay()。', estimatedMinutes: 8,
          content: [
            { type: 'markdown', content: '`setup()` 在 Arduino 開機時只做一次準備；`loop()` 會不斷重複執行。' },
            { type: 'code', language: 'cpp', title: '板載 LED 閃爍程式', code: blinkCode, highlightLines: [2, 6, 7, 8, 9] },
            { type: 'callout', tone: 'info', title: '讀程式的小方法', content: '`HIGH` 是亮，`LOW` 是暗；`delay(1000)` 是停 1000 毫秒，也就是 1 秒。' },
          ],
          exercises: [{ id: '1-1-delay', type: 'multiple-choice', question: '把 delay(1000) 改成 delay(100)，LED 會怎麼變？', options: [{ id: 'a', label: '閃得更快' }, { id: 'b', label: '閃得更慢' }, { id: 'c', label: '完全不會亮' }], correctOptionId: 'a', explanation: '等待時間從 1 秒變成 0.1 秒。', required: true }],
          hardwareTask: { title: '實作：讓板載 LED 閃更快', instructions: ['在 Arduino IDE 貼上程式。', '把兩個 delay(1000) 都改成 delay(100)。', '按下 Upload，觀察 UNO 板載 LED。'], expectedObservation: 'LED 會比原本每秒一次更快地閃爍。', completionQuestion: '你有看到 LED 閃爍速度改變嗎？' },
          completionRule: { requiredExerciseIds: ['1-1-delay'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-2', title: '變數：幫資料取名字', summary: '使用 int 變數保存與重複使用資料。', estimatedMinutes: 7,
          content: [
            { type: 'markdown', content: '變數像一個有名字的盒子。`int waitTime = 500;` 表示建立一個叫 `waitTime` 的整數資料，內容是 500。' },
            { type: 'code', language: 'cpp', title: '用變數控制等待時間', code: 'int waitTime = 500;\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(waitTime);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(waitTime);\n}' },
            { type: 'callout', tone: 'success', title: '變數的好處', content: '想改速度時，只需改一個地方。' },
          ],
          exercises: [{ id: '1-2-blank', type: 'fill-blank', question: '補上型別：___ waitTime = 500;', acceptedAnswers: ['int'], explanation: '`int` 用來存整數。', required: true }],
          hardwareTask: { title: '實作：修改 waitTime', instructions: ['把 waitTime 改成 100。', 'Upload 後觀察 LED。'], expectedObservation: 'LED 閃爍變快。' },
          completionRule: { requiredExerciseIds: ['1-2-blank'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-3', title: '讀取外面的世界', summary: '用 analogRead(A0) 讀取光敏電阻。', estimatedMinutes: 8,
          content: [
            { type: 'markdown', content: '光敏電阻會隨光線改變電阻。配合固定電阻形成分壓後，Arduino 可以從 A0 讀到 0 到 1023 的數值。' },
            { type: 'code', language: 'cpp', title: '讀取光線數值', code: 'int lightValue = analogRead(A0);' },
            { type: 'callout', tone: 'warning', title: '接線提示', content: '光敏電阻不能單獨直接量光，需要和固定電阻組成分壓電路。' },
          ],
          exercises: [{ id: '1-3-input', type: 'multiple-choice', question: 'analogRead(A0) 做了什麼？', options: [{ id: 'a', label: '讀取 A0 的類比數值' }, { id: 'b', label: '讓 D9 輸出電壓' }, { id: 'c', label: '控制伺服馬達角度' }], correctOptionId: 'a', explanation: 'A0 是 Arduino UNO 的類比輸入腳位。', required: true }],
          hardwareTask: { title: '實作：接上光敏電阻', instructions: ['確認光敏電阻與固定電阻已組成分壓。', '將分壓中點接到 A0。', '請老師或組員一起檢查接線。'], expectedObservation: '接線完成後才進入下一關。' },
          completionRule: { requiredExerciseIds: ['1-3-input'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-4', title: '看看 Arduino 看到了什麼', summary: '使用 Serial Monitor 觀察光線數值。', estimatedMinutes: 7,
          content: [
            { type: 'markdown', content: 'Arduino 不知道「亮」或「暗」，它真正取得的是數字。請用 Serial Monitor 觀察這些數字如何隨光線變化。' },
            { type: 'code', language: 'cpp', title: '印出光敏電阻數值', code: 'void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int lightValue = analogRead(A0);\n  Serial.println(lightValue);\n  delay(100);\n}' },
          ],
          exercises: [{ id: '1-4-reflection', type: 'reflection', question: '遮住光敏電阻後，你在 Serial Monitor 觀察到什麼？', placeholder: '例如：數值從…變成…', minimumLength: 5, required: true }],
          hardwareTask: { title: '實作：觀察 Serial Monitor', instructions: ['Upload 程式。', '開啟 Serial Monitor，速率設為 9600。', '遮住、放開並靠近燈光，觀察數值。'], expectedObservation: '數值會隨實際光線改變。' },
          completionRule: { requiredExerciseIds: ['1-4-reflection'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-5', title: '把一種數值變成另一種', summary: '使用 map() 把 0–1023 對應到 0–180。', estimatedMinutes: 7,
          content: [
            { type: 'diagram', title: '範圍轉換', content: 'lightValue（0 ─── 1023） → map() → angle（0° ─── 180°）' },
            { type: 'code', language: 'cpp', title: '將光線轉成角度', code: 'int angle = map(lightValue, 0, 1023, 0, 180);' },
            { type: 'markdown', content: '這一步是 **Process**：把感測數值處理成馬達可使用的角度。' },
          ],
          exercises: [{ id: '1-5-map', type: 'multiple-choice', question: 'lightValue 約為 512 時，angle 最接近多少？', options: [{ id: 'a', label: '0°' }, { id: 'b', label: '90°' }, { id: 'c', label: '180°' }], correctOptionId: 'b', explanation: '512 約在 0 到 1023 的中間。', required: true }],
          hardwareTask: { title: '實作：先印出轉換結果', instructions: ['加入 map() 程式。', '用 Serial.print 印出 lightValue、箭頭和 angle。', '改變光線並觀察兩個數字。'], expectedObservation: '光線值與角度值都會一起變化。' },
          completionRule: { requiredExerciseIds: ['1-5-map'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-6', title: '讓 Arduino 控制現實世界', summary: '使用 Servo Library 控制 SG90。', estimatedMinutes: 8,
          content: [
            { type: 'markdown', content: '`Servo motor;` 建立一個叫做 motor 的伺服馬達控制物件。`motor.write(90)` 則讓馬達移動到 90 度。' },
            { type: 'code', language: 'cpp', title: 'Servo 基本控制', code: '#include <Servo.h>\n\nServo motor;\n\nvoid setup() {\n  motor.attach(9);\n}\n\nvoid loop() {\n  motor.write(90);\n}' },
          ],
          exercises: [{ id: '1-6-servo', type: 'fill-blank', question: '補上控制角度的函式：motor.___(90);', acceptedAnswers: ['write'], explanation: '`motor.write(角度)` 讓 Servo 移到指定角度。', required: true }],
          hardwareTask: { title: '實作：測試 Servo 三個角度', instructions: ['確認 SG90 訊號線接 D9，電源與 GND 正確。', '依序讓馬達到 0°、90°、180°。', '若馬達抖動，先停止並檢查供電。'], expectedObservation: 'Servo 依序移動到三個角度。' },
          completionRule: { requiredExerciseIds: ['1-6-servo'], requiresHardwareConfirmation: true },
        },
        {
          id: '1-final', title: '整合：光控 Servo', summary: '完成 Input → Process → Output 的光控伺服馬達。', estimatedMinutes: 10,
          content: [
            { type: 'diagram', title: '完整控制流程', content: '光敏電阻 → analogRead() → lightValue → map() → angle → motor.write() → Servo' },
            { type: 'code', language: 'cpp', title: '光控 Servo 完整範例', code: lightServoCode },
            { type: 'callout', tone: 'success', title: '你已完成第一章', content: '你現在能分辨 Input、Process 與 Output，也能用程式控制真實硬體。' },
          ],
          exercises: [
            { id: '1-final-process', type: 'multiple-choice', question: '下列哪一行是 Process？', options: [{ id: 'a', label: 'analogRead(lightPin)' }, { id: 'b', label: 'map(lightValue, 0, 1023, 0, 180)' }, { id: 'c', label: 'motor.write(angle)' }], correctOptionId: 'b', explanation: 'map() 將輸入資料轉換成輸出要用的資料。', required: true },
            { id: '1-final-reflection', type: 'reflection', question: '用一句話說明這個作品的 Input、Process、Output。', placeholder: 'Input 是…；Process 是…；Output 是…', minimumLength: 15, required: true },
          ],
          hardwareTask: { title: '實作：完成光控 Servo', instructions: ['Upload 完整範例。', '以手遮住或照亮光敏電阻。', '觀察 Servo 是否對應地改變角度。'], expectedObservation: 'Servo 會隨光線讀值改變角度。' },
          completionRule: { requiredExerciseIds: ['1-final-process', '1-final-reflection'], requiresHardwareConfirmation: true },
        },
      ],
    },
    {
      id: 'ai-collaboration',
      title: '第二章｜生成式 AI 協作開發',
      description: '先把需求說清楚，再請 AI 協助並親自驗證。',
      levels: [
        {
          id: '2-1', title: '好的需求是什麼？', summary: '比較模糊與完整的需求。', estimatedMinutes: 8,
          content: [
            { type: 'markdown', content: 'AI 需要清楚的 Context。只說「幫我寫 Arduino 馬達程式」太模糊；包含硬體、接腳、控制方式與行為的需求，AI 才更容易給出適合的回答。' },
            { type: 'callout', tone: 'info', title: '下一步', content: '接下來會用「五問需求拆解法」把想法整理成可交給 AI 的 Prompt。' },
          ],
          exercises: [{ id: '2-1-prompt', type: 'multiple-choice', question: '哪一段 Prompt 資訊較完整？', options: [{ id: 'a', label: '幫我寫 Arduino 馬達程式' }, { id: 'b', label: '我使用 UNO 和 SG90，訊號接 D9，要用 Serial 輸入 OPEN/CLOSE 控制，請產生程式並解釋。' }], correctOptionId: 'b', explanation: '完整需求包含硬體、接法、控制方式和期望結果。', required: true }],
          completionRule: { requiredExerciseIds: ['2-1-prompt'] },
        },
        {
          id: '2-2', title: '五問需求拆解法', summary: '把智慧遮光板的需求整理成 Prompt。', estimatedMinutes: 15,
          content: [
            { type: 'diagram', title: 'AI 協作流程', content: '需求 → 拆解 → Prompt → AI → 程式 → 測試 → Debug' },
            { type: 'markdown', content: '請使用五個問題整理你的最終挑戰：目標、材料、控制方式、控制邏輯，以及希望 AI 如何幫忙。' },
            { type: 'callout', tone: 'warning', title: '不要讓 AI 猜', content: '如果你沒有說訊號線接在哪裡、希望如何控制，AI 不能可靠地替你決定。' },
          ],
          exercises: [{ id: '2-2-ready', type: 'reflection', question: '你準備好把想法拆成五個部分了嗎？寫下你想做的作品名稱。', placeholder: '例如：智慧遮光板', minimumLength: 2, required: true }],
          completionRule: { requiredExerciseIds: ['2-2-ready'] },
        },
      ],
    },
  ],
}

export const smartShadePromptTask: PromptTask = {
  id: 'smart-shade',
  title: '最終挑戰：智慧遮光板',
  description: '環境越亮，遮光板越關閉；環境越暗，遮光板越打開。先把需求說完整，再請 AI 幫忙。',
  template: '由後端依結構化需求產生，前端不自行加入硬體或腳位。',
  fields: [
    { id: 'goal', label: '我要做什麼？', prompt: '請描述作品目標。', type: 'textarea', required: true, placeholder: '例如：做一個會隨環境光線移動的智慧遮光板。' },
    { id: 'hardware', label: '我有哪些材料？', prompt: '請列出硬體與接法。', type: 'textarea', required: true, placeholder: '例如：Arduino UNO、光敏電阻、10kΩ 電阻、SG90；光敏電阻接 A0，Servo 訊號接 D9。' },
    { id: 'control', label: '我要怎麼控制？', prompt: '請說明輸入來源。', type: 'textarea', required: true, placeholder: '例如：由光敏電阻讀取環境光線。' },
    { id: 'logic', label: '遇到不同情況，要怎麼做？', prompt: '請說明控制邏輯。', type: 'textarea', required: true, placeholder: '例如：越亮時遮光板越關閉，越暗時越打開。' },
    { id: 'aiHelp', label: '我要 AI 怎麼幫？', prompt: '選擇希望 AI 提供的協助。', type: 'select', required: true, options: [
      { id: 'hint', label: '給我提示' },
      { id: 'teach', label: '一步一步教我' },
      { id: 'write-and-explain', label: '幫我寫完整程式並解釋' },
      { id: 'debug', label: '幫我 Debug' },
      { id: 'improve', label: '幫我改善程式' },
    ] },
  ],
}
