# 部署指南

## GitHub Pages 前端

1. 將 Repository 的 Pages Source 設為 GitHub Actions。
2. 若只需要教材與前端流程展示，不必設定 Variables；網站會使用 Mock Prompt Coach。
3. 若要使用真正 Backend，建立 Repository Variables `VITE_MOCK_AI=false` 和 `VITE_API_BASE_URL`（Backend 的固定 HTTPS 網址）。
4. Push 到 `main` 後，由 `.github/workflows/deploy-pages.yml` 自動執行 typecheck、test、build 與部署。

Vite production base 會依 Repository 名稱設定為 `/<repo-name>/`，前端使用 HashRouter，重新整理不需要 404 fallback。

## Linux Backend

Backend 建議只監聽本機或受保護的網路介面，再由 HTTPS reverse proxy 或 Cloudflare Tunnel 對外提供服務。

必要設定：

```env
PORT=3000
FRONTEND_ORIGIN=https://<username>.github.io
AI_PROVIDER=mock
PROMPT_COACH_PROVIDER=codex
CODEX_MODEL=gpt-5.4-mini
MAX_AI_CONCURRENCY=5
AI_REQUEST_TIMEOUT_MS=60000
```

正式使用 CodexProvider 時，另以服務管理工具安全注入 `CODEX_API_KEY`。不得將 key 寫進 `.env.example`、Repository、前端環境或 log。

## 無固定 IP

建議使用 Named Cloudflare Tunnel，將固定子網域（例如 `arduino-api.example.com`）路由至 `http://localhost:3000`。Tunnel 與 Backend 都應由 service manager 管理並設定自動重啟。

正式上課前需從校外網路驗證：

- `/health` 可透過 HTTPS 存取。
- CORS 只允許正式 GitHub Pages Origin。
- 30 位學生的 Mock Prompt Coach 並行測試可完成。
- 真實 Provider 的 timeout、queue 與錯誤訊息符合預期。
- Linux 主機不會睡眠，Backend 與 Tunnel 能在重新開機後恢復。

## 課堂備援

若 Backend 或 AI Provider 暫時不可用，Prompt Builder 與 Prompt Preview 仍需保留學生輸入，讓學生複製 Prompt 到自己的 Coding AI、Gemini、ChatGPT 或 Copilot 繼續課程。
