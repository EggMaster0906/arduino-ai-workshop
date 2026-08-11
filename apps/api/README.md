# Arduino × AI Lab API

提供學習網站的健康檢查、Prompt Coach、Arduino 程式生成與 Debug API。學生不需登入；匿名 session 僅用於流量限制，不能當作授權憑證。

## 開發

在專案根目錄安裝依賴後執行：

```bash
npm run dev:api
```

本機預設使用 Mock Provider。複製環境變數範本後可調整設定：

```bash
cp apps/api/.env.example apps/api/.env
```

`apps/api/.env` 不會被 Git 追蹤，絕對不可放入任何 real API key。

## 驗證

```bash
npm run typecheck --workspace @arduino-ai/api
npm run test --workspace @arduino-ai/api
npm run build --workspace @arduino-ai/api
```

## API

- `GET /health`：確認服務可用。
- `POST /api/prompt/coach`：檢查五問需求、回傳缺漏與由後端模板組裝的 Prompt。
- `POST /api/ai/code`：依確認後的 Prompt 產生適合 Arduino UNO 初學者的 C++ 程式。
- `POST /api/ai/debug`：依測試現象提供最多五項檢查步驟與必要的程式修改建議。

請在請求 body 傳入 optional `anonymousSessionId`（UUID）；Coding、Debug endpoint 會以它進行每 session rate limit，缺少時才退回 IP 限制。

## Provider

`AI_PROVIDER=mock` 適合開發和課前功能演練。亦可分別設定：

```env
PROMPT_COACH_PROVIDER=codex
CODING_PROVIDER=codex
DEBUG_PROVIDER=codex
CODEX_MODEL=gpt-5.4-mini
CODEX_API_KEY=由部署環境的 secret store 注入
```

Codex 模型是後端 allowlist 的唯一值；request 無法傳入模型或 CLI 參數。每次呼叫均使用固定空白工作目錄、`codex exec --sandbox read-only --ephemeral`、stdin 與 JSON output schema。`CODEX_API_KEY` 只會注入單一 `codex exec` 子程序，不會寫入檔案或 API response。

正式上課前，請以部署環境的 secret store 注入 key，將 Provider 改為 `codex`，再呼叫 `/health` 及用一個非敏感測試 Prompt 驗證模型可用性。建議將服務放在反向代理或 Cloudflare Tunnel 後方，僅以固定 HTTPS 網域供 GitHub Pages 前端存取。
