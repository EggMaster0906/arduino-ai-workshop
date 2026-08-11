# E2E 可測試性契約

`tests/e2e/scenario-a-f.spec.ts` 是最終 Scenario A–F 的自動化規格。前端整合課程資料時，請保留以下 `data-testid`；它們是測試用穩定契約，不應依視覺文案改動而移除。

| 範圍 | 必要 data-testid |
|---|---|
| 首頁／Session | `course-start`、`student-display-name`、`student-display-name-current`、`course-progress` |
| 課程頁 | `lesson-page`、`complete-level`、`hardware-task-{levelId}` |
| 題目 | `exercise-{exerciseId}`、選項 `exercise-{exerciseId}-option-{optionId}` |
| Prompt Builder | `prompt-task-{taskId}`、`prompt-field-{fieldId}`、checkbox `prompt-field-hardware-{optionId}`、`prompt-coach-submit`、`prompt-clarification` |
| Prompt Preview | `prompt-preview`、`structured-requirement`、`final-prompt`、`use-built-in-coding-ai` |
| Coding AI／測試 | `coding-ai-generate`、`coding-ai-code`、`coding-ai-explanation`、`test-result-{resultId}`、`test-result-continue` |
| Debug | `debug-problem`、`debug-hardware-state`、`debug-attempted-fixes`、`debug-submit`、`debug-result`、`debug-checks` |

補充契約：

- Prompt Builder 要能由 `?task=servo-gate` 與 `?task=smart-shade` 選擇對應任務；沒有 query 時可使用預設任務。
- `hardware` 的 `checkbox-group` 必須實作為真正的 checkbox，而不是 textarea。
- `teacherMode=1` 用於教師／E2E 解鎖檢視；它不是安全邊界。HashRouter 目前可支援 `/?teacherMode=1#/course/...`。
- E2E 使用 `VITE_MOCK_AI=true`，不得對外呼叫真實 API、CLI 或使用 API key。
- 題目和功能按鈕仍必須有可理解的可及性名稱；test id 不是 label 的替代品。
