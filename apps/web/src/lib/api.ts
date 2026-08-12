import {
  promptCoachResponseSchema,
  type PromptCoachRequest,
  type PromptCoachResponse,
} from '@arduino-ai/shared'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000'
const useMockAi = import.meta.env.VITE_MOCK_AI === 'true'

export class AiRequestError extends Error {
  constructor(message = 'AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。') {
    super(message)
    this.name = 'AiRequestError'
  }
}

async function post<T>(path: string, body: unknown, parse: (value: unknown) => { success: boolean; data?: T }) {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(65_000),
    })
  } catch {
    throw new AiRequestError()
  }
  if (!response.ok) throw new AiRequestError()
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new AiRequestError()
  }
  const parsed = parse(payload)
  if (!parsed.success || !parsed.data) throw new AiRequestError()
  return parsed.data
}

type MissingField = { field: string; question: string }

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function mockMissingFields(request: PromptCoachRequest): MissingField[] {
  const values = request.requirements
  const field = (key: string) => textValue(values[key])
  const missing: MissingField[] = []
  const requiredFields: Array<[string, string]> = [
    ['goal', '你想做出什麼作品或效果？'],
    ['hardware', '請列出你現在會使用的 Arduino、感測器或輸出裝置。'],
    ['control', '你想用什麼方式控制這個作品？'],
    ['logic', '不同情況發生時，你希望 Arduino 分別怎麼做？'],
    ['aiHelp', '你希望 AI 提示、逐步教學、寫程式，還是解釋程式？'],
  ]
  requiredFields.forEach(([key, question]) => {
    if (!field(key)) missing.push({ field: key, question })
  })

  const allDetails = Object.values(values).filter((value): value is string => typeof value === 'string').join(' ')
  const hasServo = /\b(?:sg90|servo)\b/i.test(allDetails)
  const hasPin = /\bD\s*(?:[0-9]|1[0-3])\b/i.test(allDetails)
  const logic = field('logic')
  const hasConditionToAction = /(?:→|=>|當|如果|若|時|對應|變成)/.test(logic)

  if (['servo-gate', 'smart-shade'].includes(request.taskId) && hasServo && !hasPin) {
    missing.push({ field: 'servoPin', question: 'SG90 的訊號線接在哪一個 Arduino 腳位？' })
  }
  if (request.taskId === 'servo-gate' && (!/\bopen\b|打開|開啟/i.test(logic) || !/\bclose\b|關閉|關上/i.test(logic) || !hasConditionToAction)) {
    missing.push({ field: 'logic', question: '請分別寫出收到 OPEN 與 CLOSE 時，Servo 要轉到哪個角度或做什麼動作（例如 OPEN → 90°；CLOSE → 0°）。' })
  }
  if (request.taskId === 'smart-shade' && (!/亮|暗|光|數值/.test(logic) || !/servo|伺服|角度|度|打開|關閉|轉到/i.test(logic) || !hasConditionToAction)) {
    missing.push({ field: 'logic', question: '請寫出亮／暗（或感測數值）各自對應的 Servo 動作或角度，並標示條件與動作的關係。' })
  }

  return [...new Map(missing.map((item) => [item.field, item])).values()]
}

function mockCoach(request: PromptCoachRequest): PromptCoachResponse {
  const missingFields = mockMissingFields(request)
  if (missingFields.length > 0) {
    return {
      complete: false,
      missingFields,
      structuredRequirement: request.requirements,
      prompt: null,
    }
  }
  const values = request.requirements
  const field = (key: string) => typeof values[key] === 'string' ? values[key] : ''
  return {
    complete: true,
    missingFields: [],
    structuredRequirement: values,
    prompt: ['我正在進行一個 Arduino 專案。', '', '【目標】', field('goal'), '', '【硬體】', field('hardware'), '', '【控制方式】', field('control'), '', '【控制邏輯】', field('logic'), '', '【需要 AI 協助】', field('aiHelp'), '', '我是 Arduino 初學者，請使用容易理解的方式回答。', '如果資訊不足，請先指出缺少的資訊，不要自行假設。'].join('\n'),
  }
}

export async function coachPrompt(request: PromptCoachRequest) {
  if (useMockAi) return mockCoach(request)
  return post('/api/prompt/coach', request, (value) => promptCoachResponseSchema.safeParse(value))
}

export { apiBaseUrl }
