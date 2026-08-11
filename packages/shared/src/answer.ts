import type { Exercise } from "./course.js";

function normalizeAnswer(value: string, caseSensitive: boolean): string {
  const trimmed = value.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

/**
 * Checks an exercise answer for both immediate feedback and lesson completion.
 * Fill-in answers may include surrounding explanation as long as they contain
 * one configured accepted keyword.
 */
export function isExerciseAnswerCorrect(exercise: Exercise, answer: unknown): boolean {
  if (exercise.type === "multiple-choice") {
    return answer === exercise.correctOptionId;
  }

  if (exercise.type === "fill-blank") {
    if (typeof answer !== "string") return false;

    const candidate = normalizeAnswer(answer, exercise.caseSensitive ?? false);
    return exercise.acceptedAnswers.some((accepted) => {
      const keyword = normalizeAnswer(accepted, exercise.caseSensitive ?? false);
      return keyword.length > 0 && candidate.includes(keyword);
    });
  }

  return typeof answer === "string" && answer.trim().length >= (exercise.minimumLength ?? 1);
}
