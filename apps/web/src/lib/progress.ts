import type { Course, Level, StudentState } from '@arduino-ai/shared'

// 開發與課前測試預設可自由檢視所有章節。正式上課時，設定
// VITE_LOCK_LESSON_PROGRESSION=true 即可恢復依序解鎖。
export const lessonProgressionLocked = import.meta.env.VITE_LOCK_LESSON_PROGRESSION === 'true'

export function getLevels(course: Course) {
  return course.chapters.flatMap((chapter) => chapter.levels)
}

export function findLevel(course: Course, levelId: string) {
  return getLevels(course).find((level) => level.id === levelId)
}

export function getNextLevel(course: Course, levelId: string) {
  const levels = getLevels(course)
  const index = levels.findIndex((level) => level.id === levelId)
  return index >= 0 ? levels[index + 1] : undefined
}

export function getPreviousLevel(course: Course, levelId: string) {
  const levels = getLevels(course)
  const index = levels.findIndex((level) => level.id === levelId)
  return index > 0 ? levels[index - 1] : undefined
}

function isAnswerComplete(level: Level, answerId: string, answer: unknown) {
  const exercise = level.exercises?.find((item) => item.id === answerId)
  if (!exercise) return false
  if (exercise.type === 'multiple-choice') return answer === exercise.correctOptionId
  if (exercise.type === 'fill-blank') {
    if (typeof answer !== 'string') return false
    const normalized = exercise.caseSensitive ? answer.trim() : answer.trim().toLowerCase()
    return exercise.acceptedAnswers.some((accepted) => (exercise.caseSensitive ? accepted : accepted.toLowerCase()) === normalized)
  }
  return typeof answer === 'string' && answer.trim().length >= (exercise.minimumLength ?? 1)
}

export function canCompleteLevel(level: Level, state: StudentState) {
  const requiredExercises = level.completionRule.requiredExerciseIds ?? level.exercises?.filter((exercise) => exercise.required).map((exercise) => exercise.id) ?? []
  const exercisesComplete = requiredExercises.every((id) => isAnswerComplete(level, id, state.answers[id]))
  const hardwareComplete = !level.completionRule.requiresHardwareConfirmation || state.hardwareConfirmations[level.id] === true
  const activitiesComplete = (level.completionRule.requiredActivityIds ?? []).every((id) => state.completedActivities.includes(id))
  return exercisesComplete && hardwareComplete && activitiesComplete
}

export function getProgress(course: Course, state: StudentState | null) {
  const total = getLevels(course).length
  const completed = state?.completedLevels.length ?? 0
  return { completed, total, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) }
}

export function canOpenLevel(course: Course, state: StudentState, targetId: string) {
  if (!lessonProgressionLocked) return true
  const levels = getLevels(course)
  const targetIndex = levels.findIndex((level) => level.id === targetId)
  if (targetIndex <= 0 || state.completedLevels.includes(targetId)) return true
  return state.completedLevels.includes(levels[targetIndex - 1]?.id ?? '')
}
