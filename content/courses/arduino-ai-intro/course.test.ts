import { describe, expect, it } from "vitest";
import { flattenLevels } from "@arduino-ai/shared";
import { arduinoAiIntroCourse } from "./course.js";
import { arduinoAiIntroPromptTasks } from "./prompt-tasks.js";

describe("Arduino × AI 課程資料", () => {
  it("covers every planned level in a 120-minute course", () => {
    const levels = flattenLevels(arduinoAiIntroCourse);

    expect(levels.map((item) => item.id)).toEqual([
      "1-0",
      "1-1",
      "1-2",
      "1-3",
      "1-4",
      "1-5",
      "1-6",
      "1-final",
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2-5",
      "2-6",
      "2-7",
      "2-final",
    ]);
    expect(arduinoAiIntroCourse.estimatedMinutes).toBe(120);
  });

  it("makes every in-content question refer to an exercise", () => {
    for (const level of flattenLevels(arduinoAiIntroCourse)) {
      const exerciseIds = new Set((level.exercises ?? []).map((exercise) => exercise.id));
      for (const block of level.content) {
        if (block.type === "question") {
          expect(exerciseIds.has(block.exerciseId)).toBe(true);
        }
      }
    }
  });

  it("ships both guided Prompt Builder tasks", () => {
    expect(arduinoAiIntroPromptTasks.map((task) => task.id)).toEqual([
      "servo-gate",
      "smart-shade",
    ]);
    expect(arduinoAiIntroPromptTasks[0]?.clarifications?.[0]?.field).toBe("servoPin");
  });
});
