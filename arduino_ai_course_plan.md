# Arduino × 生成式 AI 協作開發體驗課

## 一、課程基本資訊

- **課程對象：** 國中生
- **課程時間：** 2 小時
- **主要硬體：**
  - Arduino UNO
  - SG90 伺服馬達
  - 光敏電阻
  - 固定電阻（與光敏電阻組成分壓電路）
  - USB 傳輸線
  - 電腦
- **主要軟體與平台：**
  - Arduino IDE
  - 自建學習網站
  - 生成式 AI
  - 後端 Prompt Coach（可串接 Codex CLI / Antigravity CLI）

---

## 二、課程定位

本課程不以「完整學會 Arduino / C++」為目標，而是讓學生在短時間內建立一套基礎的程式與 AI 協作思維。

整體學習流程為：

```text
看懂程式
    ↓
修改程式
    ↓
控制硬體
    ↓
理解感測與控制
    ↓
拆解需求
    ↓
組成 Prompt
    ↓
與 AI 協作
    ↓
實際測試
    ↓
Debug 與修正
```

課程分為兩個主要章節：

1. **Arduino 基礎程式設計**
2. **生成式 AI 協作開發**

第一章先讓學生理解 Arduino 程式如何控制硬體；第二章再讓學生將這些知識轉化為需求，透過 AI 協助完成新的開發任務。

---

# 三、課程學習成果

課程結束後，希望學生至少能做到：

1. 看懂 Arduino 程式的基本結構 `setup()`、`loop()`。
2. 理解函式、參數與變數的基本概念。
3. 使用 `analogRead()` 讀取光敏電阻數值。
4. 使用 Serial Monitor 觀察 Arduino 取得的資料。
5. 使用 `map()` 將感測值轉換成另一個控制範圍。
6. 使用 Servo Library 控制伺服馬達角度。
7. 理解基本的 **Input → Process → Output** 控制概念。
8. 能將 Arduino 任務拆解為結構化需求。
9. 能依照需求範本整理出完整 Prompt。
10. 能利用生成式 AI 產生、閱讀、測試與修改 Arduino 程式。
11. 理解 AI 產生的結果需要經過測試與驗證，不能直接假設其正確。

---

# 四、建議課程時間配置

| 時間 | 內容 |
|---:|---|
| 0–10 分鐘 | 課程導入、Arduino 與 AI 簡介 |
| 10–60 分鐘 | 第一章：Arduino 基礎程式設計 |
| 60–70 分鐘 | 第一章整合實作 |
| 70–95 分鐘 | 第二章：AI 協作開發 |
| 95–115 分鐘 | AI 開發挑戰 |
| 115–120 分鐘 | 成果展示與課程總結 |

> 實際時間可依學生操作速度與硬體狀況調整。

---

# 五、第一章：Arduino 基礎程式設計

## Chapter 1-0｜認識 Arduino

### 學習目標

讓學生先理解今天要做的事情不是單純「學程式語法」，而是使用程式讓電子裝置感知並影響真實世界。

### 核心概念

```text
真實世界
   ↓
感測器
   ↓
Arduino
   ↓
程式處理
   ↓
輸出裝置
```

本課程最後會完成：

```text
環境光線
   ↓
光敏電阻
   ↓
Arduino
   ↓
計算角度
   ↓
伺服馬達
```

### 簡介內容

- Arduino UNO
- USB 連線
- Digital / Analog Pin
- Arduino IDE
- Compile / Upload

本段不深入電子學與微控制器架構。

---

## Chapter 1-1｜程式怎麼運作？

### 核心語法

```cpp
void setup() {

}

void loop() {

}
```

### 概念

```text
Arduino 開機
    ↓
setup() 執行一次
    ↓
loop()
    ↓
loop()
    ↓
loop()
    ↓
……
```

### UNO 實作：板載 LED

```cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);

  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

### 學習重點

- `setup()`
- `loop()`
- 程式由上到下執行
- 函式呼叫
- 參數
- `delay()`
- `HIGH` / `LOW`

### 學習網站任務

例如：

> LED 現在每秒切換一次，請讓它閃得更快。

學生將：

```cpp
delay(1000);
```

修改為：

```cpp
delay(100);
```

並 Upload 到 UNO 實際觀察。

---

## Chapter 1-2｜變數：幫資料取名字

### 核心語法

```cpp
int waitTime = 500;
```

### 概念

```text
int      waitTime      500
↓           ↓           ↓
資料型態    名字        內容
```

此階段不深入介紹 C++ 型別系統，只建立：

> 變數可以用來記住資料，而且可以幫資料取一個容易理解的名字。

### UNO 實作

```cpp
int waitTime = 500;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(waitTime);

  digitalWrite(LED_BUILTIN, LOW);
  delay(waitTime);
}
```

### 學習網站任務

- 修改 `waitTime`
- 預測 LED 的閃爍速度
- 建立一個新的整數變數
- 理解使用變數後，只需要修改一處即可改變多個地方的行為

---

## Chapter 1-3｜Arduino 怎麼感覺外面的世界？

### 核心概念

開始建立 **Input** 的概念。

### 核心語法

```cpp
analogRead(A0);
```

結合變數：

```cpp
int lightValue = analogRead(A0);
```

自然語言理解：

> 讀取 A0 的數值，並把讀到的結果存進 `lightValue`。

### 硬體

使用：

- 光敏電阻
- 固定電阻
- Arduino A0

光敏電阻與固定電阻組成分壓電路。

本課程不深入電阻公式，只簡單說明：

> 光敏電阻會隨光線改變電阻，因此 Arduino 能讀到不同的電壓，最後轉換成數字。

---

## Chapter 1-4｜看看 Arduino 看到了什麼

### 核心工具

Serial Monitor

### 核心語法

```cpp
Serial.begin(9600);
```

以及：

```cpp
Serial.println(lightValue);
```

### UNO 實作

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  int lightValue = analogRead(A0);

  Serial.println(lightValue);

  delay(100);
}
```

### 學生實驗

嘗試：

- 用手遮住光敏電阻
- 放開
- 靠近燈光
- 改變光線距離

觀察 Serial Monitor：

```text
825
790
620
430
210
95
```

### 核心觀念

Arduino 不知道「亮」或「暗」。

Arduino 真正取得的是：

```text
825
```

也就是：

> **真實世界的狀態會被感測器轉換成程式可以處理的數值。**

---

## Chapter 1-5｜把一種數值變成另一種

### 核心語法

```cpp
map()
```

### 問題情境

Arduino 類比輸入：

```text
0 ───────────────────── 1023
```

SG90 伺服馬達需要的角度：

```text
0° ──────────────────── 180°
```

因此需要將兩個不同範圍對應起來。

### 程式

```cpp
int angle = map(lightValue, 0, 1023, 0, 180);
```

### 概念

```text
lightValue = 0
→ angle = 0°

lightValue ≈ 512
→ angle ≈ 90°

lightValue = 1023
→ angle = 180°
```

此階段不深入介紹線性映射公式，只建立「範圍轉換」概念。

### 實作

先不控制 Servo，只將結果印出：

```cpp
Serial.print(lightValue);
Serial.print(" -> ");
Serial.println(angle);
```

可能看到：

```text
856 -> 150
621 -> 109
305 -> 53
102 -> 17
```

讓學生先理解：

> 感測數值可以經過程式處理，轉換成另一個有用途的數值。

---

## Chapter 1-6｜讓 Arduino 控制現實世界

### 核心硬體

SG90 伺服馬達

### 核心語法

```cpp
#include <Servo.h>

Servo motor;
```

以及：

```cpp
motor.attach(9);
motor.write(90);
```

### 概念

不深入解釋 Class / Object，只用直覺方式理解：

```cpp
Servo motor;
```

代表：

> 建立一個叫做 `motor` 的伺服馬達控制物件。

```cpp
motor.write(90);
```

代表：

> 讓 `motor` 移動到 90°。

### 小任務

讓 Servo 依序移動：

```text
0° → 90° → 180°
```

---

# 六、第一章 Final｜光控伺服馬達

將前面所有概念整合。

### 最終程式範例

```cpp
#include <Servo.h>

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
}
```

### 學習網站理解題

請學生指出：

- 哪一行負責 Input？
- 哪一行負責 Process？
- 哪一行負責 Output？
- `lightValue` 是什麼？
- `angle` 是什麼？
- `map()` 在這裡負責什麼？
- `motor.write(angle)` 會造成什麼效果？

### 最終概念

```text
       INPUT
         ↓
     光敏電阻
         ↓
   analogRead()
         ↓
   lightValue
         ↓
      PROCESS
         ↓
       map()
         ↓
      angle
         ↓
      OUTPUT
         ↓
   motor.write()
         ↓
    Servo 馬達
```

第一章核心模型：

# Input → Process → Output

---

# 七、第一章延伸語法

## `if` 條件判斷

`if` 不列入第一章必要主線，但可作為延伸 Challenge，並為第二章的「需求判斷」概念鋪路。

例如：

> 如果光線低於 300，就讓 Servo 回到 0°。

```cpp
if (lightValue < 300) {
  motor.write(0);
}
```

建立：

> 「遇到什麼情況，要做什麼？」

的程式思維。

## 暫不納入主線的內容

為控制課程難度與時間，第一版不正式教：

- `for`
- `while`
- Array
- 自訂函式
- Pointer
- 進階資料型態
- C++ Class / Object 正式概念

---

# 八、第二章：與生成式 AI 協作開發

## Chapter 2-1｜為什麼 AI 需要清楚的需求？

先比較兩個 Prompt。

### Prompt A

```text
幫我寫 Arduino 馬達程式
```

### Prompt B

```text
我使用 Arduino UNO 和 SG90。

Servo 訊號接在 D9。

我希望輸入 OPEN 時 Servo 到 90 度，
輸入 CLOSE 時回到 0 度。

請產生 Arduino 程式並解釋。
```

讓學生判斷：

> 哪一個 Prompt 比較容易讓 AI 正確理解需求？為什麼？

導入：

# 五問需求拆解法

---

# 九、五問需求拆解法

## ① 我要做什麼？

**Goal**

例如：

> 我要做一個可以開關的柵欄。

---

## ② 我有哪些東西？

**Hardware / Resource**

例如：

- Arduino UNO
- SG90 Servo
- 電腦

---

## ③ 我要怎麼控制？

**Input / Control**

例如：

> 使用 Serial Monitor 輸入文字。

---

## ④ 遇到不同情況，要怎麼做？

**Logic / Behavior**

例如：

```text
OPEN → Servo 90°
CLOSE → Servo 0°
```

本題可以自然銜接第一章的條件判斷概念。

---

## ⑤ 我要 AI 怎麼幫？

**AI Role / Output**

例如：

- 給我提示
- 一步一步教我
- 幫我寫程式
- 幫我解釋程式
- 幫我 Debug
- 幫我改善程式

核心觀念：

> 使用 AI 前，先決定自己需要 AI 扮演什麼角色。

---

# 十、Chapter 2-2｜網站 Prompt Builder

學生不直接輸入完整 Prompt，而是先在學習網站填寫結構化需求。

例如：

```text
🎯 我要做什麼？
[                              ]

🧰 我有哪些材料？
[                              ]

🎮 我要怎麼控制？
[                              ]

🧠 遇到不同情況要怎麼做？
[                              ]

🤖 我要 AI 怎麼幫？
[                              ]
```

不同題目可以依需求調整欄位，不強制每一題都使用完整五問。

---

# 十一、Chapter 2-3｜Prompt Coach

學生提交需求後，由後端 Prompt Coach 協助檢查與整理。

```text
學生輸入
    ↓
Prompt Coach
    ↓
檢查資訊是否完整
    ↓
結構化需求
    ↓
產生完整 Prompt
```

Prompt Coach 可部署於自建 Linux Server，並串接：

- Codex CLI
- Antigravity CLI
- 其他未來可替換的 AI Provider

### Prompt Coach 原則

Prompt Coach：

- 可以整理語句
- 可以分類資訊
- 可以指出缺漏
- 可以要求學生補資料
- 不應自行增加學生沒有提供的硬體或需求
- 不直接完成 Arduino 題目
- 不直接產生最終程式

它的角色是：

> **需求整理助手，而不是解題 AI。**

---

# 十二、Chapter 2-4｜需求不完整怎麼辦？

如果學生只輸入：

```text
我要讓 Servo 動
```

Prompt Coach 不應自行假設。

網站可以回覆：

> 你的需求還少了一些資訊。

例如：

```text
你希望 Servo 怎麼動？

○ 自動來回
○ 根據光線變化
○ 使用電腦控制
○ 其他：__________
```

核心觀念：

> **AI 不知道的資訊，不應該讓 AI 自己猜，而是由人把需求說清楚。**

---

# 十三、Chapter 2-5｜產生完整 Prompt

補完需求後，網站顯示 Before / After。

## 我的原始需求

```text
做一個柵欄
Arduino UNO + Servo
用電腦控制
OPEN 打開
CLOSE 關閉
```

## 整理後的 Prompt

```text
我正在使用 Arduino UNO 製作一個簡易柵欄。

【硬體】
- Arduino UNO
- SG90 Servo

【控制方式】
透過 Serial Monitor 輸入文字。

【控制邏輯】
- 輸入 OPEN 時，Servo 移動到 90°
- 輸入 CLOSE 時，Servo 移動到 0°

Servo 訊號線接 D9。

【需要你協助】
請產生適合 Arduino 初學者的程式，
並逐段解釋主要功能。
```

只有到這個階段，學生才真正將 Prompt 交給負責程式開發的生成式 AI。

---

# 十四、Chapter 2-6｜測試 AI 的程式

AI 回答後，任務並沒有結束。

學生需要：

```text
AI 回答
   ↓
閱讀程式
   ↓
Upload
   ↓
實際測試
```

網站詢問：

> 第一次測試結果如何？

- 完全成功
- 可以執行，但效果不符合需求
- Compile Error
- 可以 Upload，但硬體沒有反應

讓學生理解：

> **AI 產生的程式不等於正確的程式。**

---

# 十五、Chapter 2-7｜Debug 也是 AI 協作

如果第一次測試失敗，進入第二輪 AI 協作。

學生填寫：

```text
發生什麼現象？
[                              ]

有沒有錯誤訊息？
[                              ]

我的實際接線？
[                              ]
```

系統重新整理：

```text
原始需求
+
原始程式
+
目前現象
+
錯誤訊息
+
實際硬體資訊
```

產生新的 Debug Prompt。

完整流程：

```text
需求
 ↓
Prompt
 ↓
AI
 ↓
程式
 ↓
測試
 ↓
問題
 ↓
Debug Prompt
 ↓
AI
 ↓
修改
 ↓
再次測試
```

核心學習：

> AI 協作不是一次性的「問問題 → 拿答案」，而是不斷觀察、提供新資訊、修正與驗證的開發流程。

---

# 十六、第二章最終挑戰

第二章不再直接重做第一章的光控 Servo，而是提供一個相似但需要重新描述需求的任務。

## 建議題目：智慧遮光板

提供：

- Arduino UNO
- 光敏電阻
- SG90 Servo

需求：

> 環境越亮時，遮光板越關閉；環境越暗時，遮光板越打開。

老師不提供完整程式。

學生需要自行完成：

```text
理解題目
   ↓
五問需求拆解
   ↓
Prompt Builder
   ↓
Prompt Coach
   ↓
完整 Prompt
   ↓
Coding AI
   ↓
閱讀程式
   ↓
UNO 實測
   ↓
Debug
```

由於第一章已經學過：

- `analogRead()`
- `map()`
- `motor.write()`

因此學生即使使用 AI 產生程式，也具備基本的閱讀與判斷能力。

---

# 十七、課程核心理念

## 第一章

> **先學會看懂程式在做什麼。**

## 第二章

> **再學會叫 AI 幫你寫，而且知道它到底寫了什麼。**

不是：

```text
第一章：自己寫程式
第二章：全部交給 AI
```

而是：

```text
第一章
建立基本程式知識
     ↓
第二章
利用這些知識與 AI 協作
```

---

# 十八、學習網站定位

網站不是單純的電子教材，而是整堂課的學習流程控制器。

基本流程：

```text
閱讀概念
   ↓
完成理解題
   ↓
Arduino IDE 實作
   ↓
UNO 驗證
   ↓
回網站回答問題
   ↓
進入下一關
```

核心原則：

> **網站負責理解，UNO 負責驗證。**

---

# 十九、網站第一版主要功能需求

## 1. 課程與闖關系統

- 第一章 / 第二章
- 關卡順序
- 關卡解鎖
- 學習進度
- 完成狀態

## 2. Arduino 基礎教材

支援：

- 語法說明
- Code Block
- 選擇題
- 填空題
- 預測執行結果
- 實機操作指示
- 理解檢核

## 3. 學習紀錄

記錄：

- 每題答案
- 關卡完成狀態
- 是否完成實機操作
- AI Prompt
- AI 協作紀錄
- Debug 次數或結果

## 4. 五問 Prompt Builder

支援：

- 動態題目
- 動態欄位
- 不同任務使用不同需求結構
- 學生需求輸入

## 5. Prompt Coach

後端 AI 負責：

- 檢查資訊缺漏
- 結構化學生需求
- 整理語句
- 產生完整 Prompt
- 不直接解題

## 6. Prompt Preview

顯示：

- 原始需求
- 結構化需求
- 最終 Prompt
- Before / After 比較

## 7. AI Coding Assistant

負責：

- 接收最終 Prompt
- 回覆 Arduino 程式
- 顯示程式碼
- 提供適合初學者的解釋

## 8. Debug Learning Flow

支援：

- 成功 / 失敗紀錄
- 錯誤現象描述
- 錯誤訊息輸入
- 實際硬體狀態
- Debug Prompt 產生
- 第二輪 AI 協作

---

# 二十、網站開發前建議先定義的資料結構

網站開始開發前，建議優先定義：

```text
Course
 ├── Chapter
 │    ├── Lesson / Level
 │    │    ├── Content
 │    │    ├── Exercise
 │    │    ├── Hardware Task
 │    │    └── Completion Rule
 │
 ├── Prompt Task
 │    ├── Requirement Fields
 │    ├── Prompt Template
 │    ├── AI Role
 │    └── Validation Rule
 │
 └── Student Progress
      ├── Answers
      ├── Level Progress
      ├── Prompt History
      └── Debug History
```

這套資料模型應能讓未來不只加入 Arduino 課程，也能延伸至其他程式設計、電子或 AI 協作課程。

---

# 二十一、硬體與課堂執行注意事項

1. **第一章建議全程搭配 UNO 實操。**
2. 前幾關可只使用 UNO 板載 LED，減少接線時間。
3. 光敏電阻與 Servo 建議在進入感測器章節後一次接好，後續不要頻繁拆線。
4. 若課堂人數較多，可考慮事前完成部分硬體接線。
5. 本課程核心為程式邏輯與 AI 協作，不應讓大量時間耗費在排查接線問題。
6. 光敏電阻若為裸 LDR，需要搭配固定電阻形成分壓電路。
7. Servo 實際可安全運作的角度可能因個體差異略小於理論上的 0–180°，實作時可視情況限制角度範圍。

---

# 二十二、課程最終希望學生帶走的觀念

### Arduino

```text
Input → Process → Output
```

### AI 協作

```text
需求
 ↓
拆解
 ↓
Prompt
 ↓
AI
 ↓
測試
 ↓
觀察
 ↓
修正
```

### 最重要的觀念

> **AI 可以幫你寫程式，但你仍然需要知道自己想做什麼、程式大概在做什麼，以及實際結果是否符合需求。**
