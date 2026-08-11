# 課堂驗收清單

## 課前環境

- [ ] Chrome 與 Edge 的新 Profile 可開啟 GitHub Pages 網址，無需 GitHub 帳號。
- [ ] 1366 × 768 下側欄、教材、題目、Prompt Builder 與 Debug 表單都可操作，沒有被固定頁尾遮住。
- [ ] `VITE_API_BASE_URL` 指向固定 HTTPS 網域，不是臨時 IP 或會變動的 Tunnel URL。
- [ ] Backend 的 CORS 僅允許正式前端 Origin；health endpoint 與 HTTPS 外部連線都已實測。
- [ ] Backend 環境變數固定為 `CODEX_MODEL=gpt-5.4-mini`，模型不會由前端 Request 覆寫；正式課前已做 API key 模型 smoke test。
- [ ] `VITE_MOCK_AI=true` 可以完成開發／E2E 流程；production build 不含 API key、CLI command、server path 或 stack trace。
- [ ] 已準備 Arduino IDE、UNO Port 權限、USB 線、預接好的光敏電阻分壓電路與 Servo 接線圖。

## Scenario A｜Arduino 基礎

- [ ] 用暱稱／座號開始匿名本機 Session，首頁顯示 16 個關卡、共 120 分鐘。
- [ ] 依序完成 1-0 至 1-6：setup/loop、LED Blink、變數、analogRead、Serial Monitor、map、Servo。
- [ ] 1-1 與 1-2 的 LED 實作必須實機 Upload 並完成確認；不可只在網頁按完成。
- [ ] 1-3 至 1-Final 確認光敏電阻與固定電阻為分壓，並在 Serial Monitor 以 9600 baud 看見讀值。
- [ ] 1-Final 需能指出 `analogRead`（Input）、`map`（Process）、`motor.write`（Output），且用光線實測 Servo。

## Scenario B｜Prompt Coach

- [ ] 輸入「柵欄、UNO、SG90、Serial、OPEN/CLOSE」但不填 Servo pin 時，Coach 只提出澄清問題，不自行選擇腳位。
- [ ] 補入實際接線 D9 後，顯示結構化需求與包含 D9 的最終 Prompt。
- [ ] Coach 回覆不得直接輸出 Arduino 程式、增加不存在硬體，或改變學生未指定的行為。

## Scenario C｜Coding AI

- [ ] Prompt Preview 清楚顯示原始需求、整理後需求、最終 Prompt。
- [ ] 可複製 Prompt 至學生自己的 Coding AI，或貼到 Gemini、ChatGPT、Copilot 等外部服務；網站不代替學生登入外部服務。
- [ ] 選擇內建 Coding AI 後，顯示 Arduino C++ 程式和適合初學者的說明。
- [ ] 模型、API key 與後端路徑不會出現在瀏覽器畫面、網址或前端 bundle。

## Scenario D｜Debug

- [ ] 對「Compile／Upload 成功但 Servo 不動」可填入現象、錯誤訊息、接線與已嘗試事項。
- [ ] Debug AI 先給 3–5 個可執行的檢查順序（供電／共地、訊號腳位、指令格式等）。
- [ ] Debug AI 不在沒有分析前整份重寫程式；若建議改碼，要指明修改位置。

## Scenario E｜Reload 與本機紀錄

- [ ] 題目答案、實作確認、已完成關卡、Prompt 與 Debug 紀錄存於同一瀏覽器的 localStorage。
- [ ] 重新整理和重新開啟同一瀏覽器後，Session 與進度仍存在。
- [ ] 「清除本機學習紀錄」有確認提示，清除後回到無 Session 的首頁。
- [ ] 在不同電腦／無痕模式不保證續課，介面不應把 anonymousSessionId 當成登入憑證或安全邊界。

## Scenario F｜新學校電腦與部署

- [ ] 全新 Chrome／Edge Profile 可直接載入首頁、開始上課，不需安裝 Node、SSH、GitHub 或網站帳號。
- [ ] HashRouter 深連結與 `?teacherMode=1` 在 GitHub Pages 可正確開啟；教師模式僅供課堂便利。
- [ ] API 故障／timeout 顯示學生可理解的訊息，且表單內容不消失，不顯示 `ECONNRESET`、path、stack trace 或 credential。

## 壓力與無障礙

- [ ] 以 Mock AI 模擬 30 位學生同時進入、重整、送 Prompt、要求程式與 Debug；檢查限流、併發限制與「稍後再試」訊息。
- [ ] Tab、Enter／Space 可操作按鈕與表單；所有欄位有 label、焦點狀態與足夠色彩對比。
- [ ] 不只依賴顏色表示正確／錯誤／完成；程式碼字型大小在教室螢幕可閱讀。
