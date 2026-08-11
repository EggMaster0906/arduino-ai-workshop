import {
  codeResponseSchema,
  debugResponseSchema,
  promptCoachResponseSchema,
  type CodeRequest,
  type CodeResponse,
  type DebugRequest,
  type DebugResponse,
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

function mockCode(): CodeResponse {
  return {
    language: 'cpp',
    message: '這是示範回覆。請先確認光敏電阻與 SG90 的接線，再 Upload 到 Arduino UNO 測試。程式會讀取 A0 的光線數值，將它轉成角度，並讓 Servo 移動。',
    code: `#include <Servo.h>\n\nServo motor;\nconst int lightPin = A0;\nconst int servoPin = 9;\n\nvoid setup() {\n  Serial.begin(9600);\n  motor.attach(servoPin);\n}\n\nvoid loop() {\n  int lightValue = analogRead(lightPin);\n  int angle = map(lightValue, 0, 1023, 180, 0);\n  motor.write(angle);\n  Serial.println(angle);\n  delay(100);\n}`,
  }
}

function mockDebug(): DebugResponse {
  return {
    analysis: '伺服馬達沒有反應時，先從供電、接地與訊號線開始確認，比起立刻重寫整份程式更有效。',
    checks: ['確認 SG90 棕色／黑色線接 Arduino GND，且所有裝置共地。', '確認紅色線有穩定的 5V 電源；若供電不足，Servo 可能抖動或不動。', '確認橘色／黃色訊號線確實接到程式中設定的 D9。', '先用 motor.write(90) 的最小程式測試 Servo。'],
    suggestedCode: null,
  }
}

export async function coachPrompt(request: PromptCoachRequest) {
  if (useMockAi) return mockCoach(request)
  return post('/api/prompt/coach', request, (value) => promptCoachResponseSchema.safeParse(value))
}

export async function generateCode(request: CodeRequest) {
  if (useMockAi) return mockCode()
  return post('/api/ai/code', request, (value) => codeResponseSchema.safeParse(value))
}

export async function debugCode(request: DebugRequest) {
  if (useMockAi) return mockDebug()
  return post('/api/ai/debug', request, (value) => debugResponseSchema.safeParse(value))
}

export { apiBaseUrl }
