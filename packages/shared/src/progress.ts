import type { Course, Level } from "./course.js";

export interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}

export function flattenLevels(course: Course): Level[] {
  return course.chapters.flatMap((chapter) => chapter.levels);
}

export function calculateCourseProgress(
  course: Course,
  completedLevelIds: readonly string[]
): CourseProgress {
  const levels = flattenLevels(course);
  const knownIds = new Set(levels.map((level) => level.id));
  const completed = new Set(completedLevelIds.filter((id) => knownIds.has(id))).size;
  const total = levels.length;

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}

export function isLevelUnlocked(
  course: Course,
  levelId: string,
  completedLevelIds: readonly string[],
  unlockAll = false
): boolean {
  if (unlockAll) return true;

  const levels = flattenLevels(course);
  const index = levels.findIndex((level) => level.id === levelId);
  if (index < 0) return false;
  if (index === 0) return true;

  const previousLevel = levels[index - 1];
  return previousLevel ? completedLevelIds.includes(previousLevel.id) : false;
}

export function canCompleteLevel(
  level: Level,
  answers: Readonly<Record<string, unknown>>,
  hardwareConfirmed: boolean,
  completedActivityIds: readonly string[] = []
): boolean {
  const requiredAnswersComplete = (level.completionRule.requiredExerciseIds ?? []).every(
    (id) => {
      const answer = answers[id];
      return answer !== undefined && answer !== null && answer !== "";
    }
  );
  const hardwareComplete =
    !level.completionRule.requiresHardwareConfirmation || hardwareConfirmed;
  const activitiesComplete = (level.completionRule.requiredActivityIds ?? []).every((id) =>
    completedActivityIds.includes(id)
  );

  return requiredAnswersComplete && hardwareComplete && activitiesComplete;
}
