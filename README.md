# Arduino × 生成式 AI 學習平台

給國中生使用的 2 小時 Arduino 與生成式 AI 協作體驗課輔助系統。網站負責教材、關卡、Prompt Builder、外部 AI 程式碼貼回與 Debug 紀錄；Arduino IDE 與 UNO 負責實際編譯、上傳及硬體驗證。

## 專案結構

```text
apps/
├── web/          React + TypeScript + Vite 前端
└── api/          Fastify + TypeScript Backend
packages/
└── shared/       共用型別、Zod schema、Prompt 與進度邏輯
content/
└── courses/      資料驅動課程與 Prompt tasks
tests/
└── e2e/          Playwright 課堂流程驗收
docs/             API、部署與 QA 文件
```

原始需求文件：

- `arduino_ai_platform_development_plan.md`
- `arduino_ai_course_plan.md`
- `SUBAGENT_WORKSTREAMS.md`

## 環境需求

- Node.js 22 以上
- npm 10 以上
- Arduino IDE（學生實機操作時使用）
- Arduino UNO、SG90、光敏電阻與固定電阻
- Codex CLI（只有真實 Prompt Coach 需要）

## 安裝

```bash
npm install
```

## 開發

啟動前端：

```bash
npm run dev:web
```

啟動 Backend：

```bash
npm run dev:api
```

預設應使用 Mock AI，開發教材與 UI 時不會呼叫真實模型。

## 環境設定

前端：

```env
VITE_API_BASE_URL=http://localhost:3000
```

課程章節會依學習進度依序解鎖；完成前一關後，才能開啟下一關。

Backend 請從 `apps/api/.env.example` 建立自己的 `.env`。第一版模型固定為：

```env
CODEX_MODEL=gpt-5.4-mini
```

`CODEX_API_KEY` 若使用，僅能存在 Backend 執行環境，不得提交到 Git、放入前端或輸出到 log。本機已完成 `codex login` 時，Backend 可使用該登入狀態而不設定 API key；部署環境則建議由 secret store 注入 API key。

## 驗證

```bash
npm run typecheck
npm run test
npm run build
```

一次執行工作區驗證：

```bash
npm run verify
```

E2E：

```bash
npx playwright install chromium
npm run test:e2e
```

## Prompt Coach Provider

開發與 CI 使用 Mock Provider。正式課堂只讓 Prompt Coach 使用 CodexProvider；程式生成與 Debug 不會呼叫網站後端模型。Provider selection、timeout、concurrency 與 rate limit 都由 Backend 環境變數控制。

CodexProvider 必須：

- 使用 `codex exec --model gpt-5.4-mini`。
- 透過 stdin 接收學生 Prompt，不把輸入拼接成 shell command。
- 使用 read-only sandbox 與 ephemeral session。
- 限制執行時間與輸出大小。
- 不接受前端指定任意 model 或 CLI argument。

## 部署

- GitHub Pages：`.github/workflows/deploy-pages.yml`（預設使用 Mock Prompt Coach，可直接作為前端功能展示）
- Backend API contract：`docs/API.md`
- Linux、HTTPS、Cloudflare Tunnel 與課堂前檢查：`docs/DEPLOYMENT.md`

GitHub Pages 使用 HashRouter。若要連接真正 Backend，請設定 Repository Variables `VITE_MOCK_AI=false` 與 `VITE_API_BASE_URL` 為固定的 Backend HTTPS 網址；未設定時會安全地使用 Mock Prompt Coach。

## 學生識別與進度

第一版不建立帳密登入。學生輸入暱稱或代號後，系統以匿名 UUID 與 `localStorage` 保存進度。

- 相同電腦、瀏覽器與 Profile 可在重新整理後繼續。
- 換電腦、無痕模式或瀏覽器資料被清除時無法延續。
- 匿名 Session ID 不是安全登入憑證。
- 共用電腦使用完畢後可清除本機學習紀錄。

## 課堂備援

Backend 暫時無法使用時，學生已填內容不得消失。學生仍可從 Prompt Preview 複製完整 Prompt，貼到自己的 Coding AI、Gemini、ChatGPT 或 Copilot 繼續課程。
