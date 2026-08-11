import { describe, expect, it } from "vitest";
import type { Course } from "./course.js";
import { calculateCourseProgress, canCompleteLevel, isLevelUnlocked } from "./progress.js";

const course: Course = {
  id: "course",
  title: "Course",
  description: "Description",
  chapters: [
    {
      id: "chapter",
      title: "Chapter",
      levels: [
        {
          id: "one",
          title: "One",
          content: [],
          completionRule: { requiredExerciseIds: ["answer"] }
        },
        {
          id: "two",
          title: "Two",
          content: [],
          completionRule: {
            requiresHardwareConfirmation: true,
            requiredActivityIds: ["test-result"]
          }
        }
      ]
    }
  ]
};

describe("course progress", () => {
  it("ignores unknown and duplicate completion IDs", () => {
    expect(calculateCourseProgress(course, ["one", "one", "unknown"])).toEqual({
      completed: 1,
      total: 2,
      percentage: 50
    });
  });

  it("unlocks levels linearly", () => {
    expect(isLevelUnlocked(course, "one", [])).toBe(true);
    expect(isLevelUnlocked(course, "two", [])).toBe(false);
    expect(isLevelUnlocked(course, "two", ["one"])).toBe(true);
  });

  it("checks required answers and hardware confirmation", () => {
    const first = course.chapters[0]?.levels[0];
    const second = course.chapters[0]?.levels[1];
    expect(first && canCompleteLevel(first, {}, false)).toBe(false);
    expect(first && canCompleteLevel(first, { answer: "ok" }, false)).toBe(true);
    expect(second && canCompleteLevel(second, {}, false, [])).toBe(false);
    expect(second && canCompleteLevel(second, {}, true, [])).toBe(false);
    expect(second && canCompleteLevel(second, {}, true, ["test-result"])).toBe(true);
  });
});
