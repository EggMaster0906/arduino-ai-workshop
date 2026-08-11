import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { StudentState } from '@arduino-ai/shared'
import { appendDebug, appendPrompt, clearStudentState, createStudentState, loadStudentState, saveStudentState } from '../lib/storage'
import type { AiWorkState } from '../lib/storage'

interface StudentContextValue {
  state: StudentState | null
  start: (data: { displayName: string; studentCode?: string; group?: string; courseId: string; firstLevelId: string }) => void
  answer: (id: string, value: unknown) => void
  confirmHardware: (levelId: string, complete: boolean) => void
  completeActivity: (activityId: string) => void
  completeLevel: (levelId: string, nextLevelId?: string) => void
  setCurrentLevel: (levelId: string) => void
  addPrompt: (item: { taskId: string; rawRequirements: Record<string, unknown>; prompt: string }) => void
  addDebug: (item: { taskId?: string; problem: string; result?: string }) => void
  reset: () => void
}

const StudentContext = createContext<StudentContextValue | null>(null)

export function StudentProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<StudentState | null>(() => loadStudentState())

  useEffect(() => {
    if (state) saveStudentState(state)
  }, [state])

  const value = useMemo<StudentContextValue>(() => ({
    state,
    start: (data) => {
      setState(createStudentState(data))
    },
    answer: (id, answerValue) => setState((current) => current ? { ...current, answers: { ...current.answers, [id]: answerValue } } : current),
    confirmHardware: (levelId, complete) => setState((current) => current ? { ...current, hardwareConfirmations: { ...current.hardwareConfirmations, [levelId]: complete } } : current),
    completeActivity: (activityId) => setState((current) => current && !current.completedActivities.includes(activityId) ? { ...current, completedActivities: [...current.completedActivities, activityId] } : current),
    completeLevel: (levelId, nextLevelId) => setState((current) => current ? {
      ...current,
      completedLevels: current.completedLevels.includes(levelId) ? current.completedLevels : [...current.completedLevels, levelId],
      currentLevelId: nextLevelId ?? levelId,
    } : current),
    setCurrentLevel: (levelId) => setState((current) => current ? { ...current, currentLevelId: levelId } : current),
    addPrompt: (item) => setState((current) => current ? appendPrompt(current, item) : current),
    addDebug: (item) => setState((current) => current ? appendDebug(current, item) : current),
    reset: () => {
      clearStudentState()
      setState(null)
    },
  }), [state])

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (!context) throw new Error('useStudent 必須放在 StudentProvider 之內')
  return context
}

export type { AiWorkState }
