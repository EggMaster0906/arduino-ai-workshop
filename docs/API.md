# Backend API Contract

所有 AI endpoint 都使用 JSON，前端透過 `VITE_API_BASE_URL` 指向 Backend。Backend 不得回傳 stack trace、CLI command、system prompt、API key 或伺服器路徑。

## Health check

```http
GET /health
```

成功時回傳 Backend 狀態、Provider 模式與版本；不得洩漏 secret。

## Prompt Coach

```http
POST /api/prompt/coach
Content-Type: application/json
```

Request：

```json
{
  "taskId": "servo-gate",
  "requirements": {
    "goal": "製作可開關的柵欄",
    "hardware": ["Arduino UNO", "SG90"],
    "control": "Serial Monitor",
    "logic": ["OPEN 時打開", "CLOSE 時關閉"],
    "aiHelp": "產生程式並解釋"
  },
  "anonymousSessionId": "optional-uuid"
}
```

Response：

```json
{
  "complete": false,
  "missingFields": [
    {
      "field": "servoPin",
      "question": "SG90 的訊號線接在哪一個 Arduino 腳位？"
    }
  ],
  "structuredRequirement": {},
  "prompt": null
}
```

## Coding AI

```http
POST /api/ai/code
Content-Type: application/json
```

```json
{
  "prompt": "完整 Prompt",
  "taskId": "servo-gate",
  "anonymousSessionId": "optional-uuid"
}
```

成功回傳：

```json
{
  "message": "適合初學者的解釋",
  "code": "#include <Servo.h>\n...",
  "language": "cpp"
}
```

## Debug AI

```http
POST /api/ai/debug
Content-Type: application/json
```

Request 包含 `originalPrompt`、`code`、`problem`、`errorMessage`、`hardwareState` 與 `attemptedFixes`。

成功回傳：

```json
{
  "analysis": "可能原因分析",
  "checks": ["先確認接地", "確認訊號線接腳"],
  "suggestedCode": null
}
```

## Generic error

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "送出的資料格式不正確，請檢查後再試一次。"
  }
}
```

完整的 schema 與 TypeScript 型別位於 `packages/shared/src/api.ts`。
