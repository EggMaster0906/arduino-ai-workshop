import {
  STUDENT_STATE_VERSION,
  parseStudentState,
  type DebugHistoryItem,
  type PromptHistoryItem,
  type StudentState,
} from '@arduino-ai/shared'

export const STUDENT_STORAGE_KEY = 'arduino-ai-lab/student-state'

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createStudentState(input: {
  displayName: string
  studentCode?: string
  group?: string
  courseId: string
  firstLevelId: string
}): StudentState {
  return {
    version: STUDENT_STATE_VERSION,
    anonymousSessionId: createId(),
    student: {
      displayName: input.displayName.trim(),
      studentCode: input.studentCode?.trim() || undefined,
      group: input.group?.trim() || undefined,
    },
    courseId: input.courseId,
    currentLevelId: input.firstLevelId,
    completedLevels: [],
    answers: {},
    hardwareConfirmations: {},
    completedActivities: [],
    promptHistory: [],
    debugHistory: [],
  }
}

/** Accept records created before completedActivities was added to the shared schema. */
function migrate(value: unknown): StudentState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  const withActivityDefaults = {
    ...candidate,
    completedActivities: Array.isArray(candidate.completedActivities) ? candidate.completedActivities : [],
  }
  return parseStudentState(withActivityDefaults)
}

export function loadStudentState(): StudentState | null {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY)
    if (!raw) return null
    return migrate(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveStudentState(state: StudentState) {
  localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(state))
}

export function clearStudentState() {
  localStorage.removeItem(STUDENT_STORAGE_KEY)
  localStorage.removeItem('arduino-ai-lab/ai-work')
}

export function appendPrompt(state: StudentState, item: Omit<PromptHistoryItem, 'id' | 'createdAt'>): StudentState {
  return {
    ...state,
    promptHistory: [...state.promptHistory, { ...item, id: createId(), createdAt: new Date().toISOString() }],
  }
}

export function appendDebug(state: StudentState, item: Omit<DebugHistoryItem, 'id' | 'createdAt'>): StudentState {
  return {
    ...state,
    debugHistory: [...state.debugHistory, { ...item, id: createId(), createdAt: new Date().toISOString() }],
  }
}

export interface AiWorkState {
  taskId: string
  requirements: Record<string, unknown>
  structuredRequirement?: Record<string, unknown>
  prompt?: string
  code?: string
  codeMessage?: string
}

export function loadAiWork(): AiWorkState | null {
  try {
    const raw = localStorage.getItem('arduino-ai-lab/ai-work')
    if (!raw) return null
    const value = JSON.parse(raw) as AiWorkState
    return typeof value.taskId === 'string' && typeof value.requirements === 'object' ? value : null
  } catch {
    return null
  }
}

export function saveAiWork(value: AiWorkState) {
  localStorage.setItem('arduino-ai-lab/ai-work', JSON.stringify(value))
}
