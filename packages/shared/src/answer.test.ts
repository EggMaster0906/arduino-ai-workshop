import { describe, expect, it } from "vitest";
import type { FillBlankExercise } from "./course.js";
import { isExerciseAnswerCorrect } from "./answer.js";

const analogReadQuestion: FillBlankExercise = {
  id: "input",
  type: "fill-blank",
  question: "哪個函式負責讀取光線？",
  acceptedAnswers: ["analogRead"]
};

describe("exercise answer matching", () => {
  it("accepts an answer that contains an accepted keyword", () => {
    expect(isExerciseAnswerCorrect(analogReadQuestion, "答案是 analogRead(A0)")).toBe(true);
  });

  it("ignores case and surrounding whitespace unless case sensitivity is requested", () => {
    expect(isExerciseAnswerCorrect(analogReadQuestion, "  ANALOGREAD  ")).toBe(true);
    expect(
      isExerciseAnswerCorrect(
        { ...analogReadQuestion, caseSensitive: true },
        "ANALOGREAD"
      )
    ).toBe(false);
  });

  it("rejects an answer without an accepted keyword", () => {
    expect(isExerciseAnswerCorrect(analogReadQuestion, "digitalWrite")).toBe(false);
  });
});
