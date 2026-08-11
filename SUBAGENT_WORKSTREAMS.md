# 子代理分工與整合計畫

## 1. 協作配置

- 主代理：需求裁決、共用契約、整合、驗證與 Git 提交。
- 子代理數量：最多同時 3 個，連同主代理共使用 4 個並行席位。
- 原始指定模型：`gpt-5.6-luna`（目前協作環境未提供）。
- 使用者核准的實際模型：`gpt-5.6-terra`。
- 使用者指定推理能力：`xhigh`（極高）。
- 啟動狀態：3 個子代理皆已使用 `gpt-5.6-terra` + `xhigh` 啟動。

所有代理開始工作前，都必須完整閱讀：

- `arduino_ai_platform_development_plan.md`
- `arduino_ai_course_plan.md`

## 2. 路徑所有權

### 主代理：架構與整合

主要責任：

- 建立 monorepo、共用工具鏈與工作區指令。
- 定義 `packages/shared` 的型別、Zod schema 與前後端 API contract。
- 整合各子代理成果，處理跨工作區變更。
- 建立 GitHub Actions、部署文件、README 與最後驗收。
- 執行全專案 typecheck、test、build 與安全檢查。

主要所有權：

```text
/
├── package.json
├── workspace 設定
├── packages/shared/
├── .github/
└── docs/
```

### 子代理 A：前端學習平台

主要責任：

- React、TypeScript、Vite 與 HashRouter 前端。
- Main Layout、首頁、關卡導覽與 Progress UI。
- Lesson Renderer、題型、Hardware Task 與可及性。
- 匿名本機 Session、localStorage schema 與 reset UX。
- Prompt Builder、Prompt Preview、外部 AI 程式碼貼回與本機 Debug Prompt 的前端畫面。
- 前端 unit/component tests。

路徑所有權：

```text
apps/web/
```

### 子代理 B：後端與 AI Provider

主要責任：

- Fastify／Express API、Zod validation 與 health check。
- Prompt Coach API；不提供 Coding AI 或 Debug AI endpoint。
- CORS、Helmet、rate limit、request limit、timeout 與 generic errors。
- concurrency limiter、Mock Provider 與 CodexProvider。
- 固定 `CODEX_MODEL=gpt-5.4-mini`，模型與 CLI argument 只接受後端 allowlist。
- Codex CLI read-only／sandbox 執行、安全 stdin、structured output 與 API tests。

路徑所有權：

```text
apps/api/
```

### 子代理 C：課程內容與驗收案例

主要責任：

- 將課程規劃轉為資料驅動的 Chapter、Level、Content Block 與 Exercise。
- 完成第一章 Arduino 教材資料與第二章 AI 協作教材資料。
- 建立 Prompt template、Clarification、Mock AI fixtures 與課堂錯誤情境。
- 建立最終 Scenario A–F 的 E2E 測試案例與驗收清單。
- 檢查內容是否適合國中生、是否符合 120 分鐘課程限制。

路徑所有權：

```text
content/
tests/e2e/
docs/qa/
```

`docs/qa/` 由子代理 C 撰寫，其他 `docs/` 內容仍由主代理負責。

## 3. 執行階段

### Phase 0：主代理先建立契約

1. 初始化 monorepo 與共用工具鏈。
2. 建立 shared types、schema、API contract 與最小 course fixture。
3. 確認各工作區可獨立 typecheck 與 test。

### Phase 1：三個子代理平行開發

- 子代理 A：Frontend Skeleton、Lesson Renderer、Progress 與 AI Flow UI。
- 子代理 B：Backend Skeleton、Mock Provider、API 與安全限制。
- 子代理 C：課程資料、Prompt fixtures 與驗收案例。

### Phase 2：主代理整合

1. 接入真實課程資料。
2. 串接前後端 API。
3. 修正共用契約差異。
4. 完成 GitHub Pages 與 Backend 部署設定。

### Phase 3：課堂強化

1. 30 位學生同時使用測試。
2. Timeout、Queue、Reload、localStorage 與錯誤 UX 測試。
3. 1366×768、Chrome／Edge 與學校網路情境驗證。
4. 執行 Scenario A–F 最終驗收。

## 4. 協作與 Git 規則

- 子代理只能直接修改自己擁有的路徑。
- 需要變更 `packages/shared` 或根目錄設定時，先回報主代理，由主代理修改。
- 子代理不得執行 `git commit`、`git rebase`、`git reset` 或切換分支。
- 主代理負責檢查差異、執行整合測試與建立提交。
- 不得還原或覆蓋其他代理的變更。
- 每次交付需附上：修改檔案、已執行測試、未解決風險與下一個依賴。

## 5. 完成門檻

每個工作流需至少通過：

```text
typecheck
unit/API/component tests
production build
```

全專案完成前還需通過：

```text
Mock AI 完整流程
前後端整合流程
Scenario A–F
GitHub Pages production build
Backend health/security smoke tests
```
