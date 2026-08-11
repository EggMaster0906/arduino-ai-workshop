import type { PromptRequirementField, PromptTask } from "@arduino-ai/shared";

/**
 * This file intentionally adds only UI guidance.  Course, Chapter, Level,
 * ContentBlock, Exercise, activities and clarifications all come directly
 * from @arduino-ai/shared.
 */
export type PromptFieldId =
  | "goal"
  | "hardware"
  | "control"
  | "logic"
  | "servoPin"
  | "aiHelp";

export type GuidedPromptField = PromptRequirementField & {
  id: PromptFieldId;
  helperText: string;
};

export type PromptTaskWithGuidance = PromptTask & {
  fields: GuidedPromptField[];
  studentReminder: string;
};
