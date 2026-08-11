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

function hasServoPin(requirements: Record<string, unknown>) {
  return Object.values(requirements).some((value) => typeof value === 'string' && /\bD?9\b/i.test(value))
}

function mockCoach(request: PromptCoachRequest): PromptCoachResponse {
  if (!hasServoPin(request.requirements)) {
    return {
      complete: false,
      missingFields: [{ field: 'servoPin', question: 'SG90 的訊號線接在哪一個 Arduino 腳位？例如 D9。' }],
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
