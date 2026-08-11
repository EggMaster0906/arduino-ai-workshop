export type CodeLanguage = "cpp" | "text" | "json" | "bash" | "typescript";

export interface MarkdownBlock {
  type: "markdown";
  content: string;
}

export interface CodeBlock {
  type: "code";
  language: CodeLanguage;
  code: string;
  title?: string;
  highlightLines?: number[];
}

export interface CalloutBlock {
  type: "callout";
  tone: "info" | "tip" | "warning" | "success" | "important";
  title?: string;
  content: string;
}

export interface DiagramBlock {
  type: "diagram";
  title?: string;
  content: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface QuestionBlock {
  type: "question";
  exerciseId: string;
}

export interface HardwareInstructionBlock {
  type: "hardware-instruction";
  title: string;
  instructions: string[];
  expectedObservation?: string;
  completionQuestion?: string;
}

export type ContentBlock =
  | MarkdownBlock
  | CodeBlock
  | CalloutBlock
  | DiagramBlock
  | ImageBlock
  | QuestionBlock
  | HardwareInstructionBlock;

interface ExerciseBase {
  id: string;
  question: string;
  explanation?: string;
  required?: boolean;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple-choice";
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill-blank";
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export interface ReflectionExercise extends ExerciseBase {
  type: "reflection";
  placeholder?: string;
  minimumLength?: number;
}

export type Exercise = MultipleChoiceExercise | FillBlankExercise | ReflectionExercise;

export interface HardwareTask {
  title: string;
  instructions: string[];
  expectedObservation?: string;
  completionQuestion?: string;
}

export interface CompletionRule {
  requiredExerciseIds?: string[];
  requiresHardwareConfirmation?: boolean;
  requiredActivityIds?: string[];
}

export interface LevelActivity {
  id: string;
  type:
    | "prompt-builder"
    | "prompt-coach"
    | "prompt-preview"
    | "coding-ai"
    | "test-result"
    | "debug-report";
  title: string;
  description?: string;
  taskId?: string;
}

export interface Level {
  id: string;
  title: string;
  summary?: string;
  estimatedMinutes?: number;
  content: ContentBlock[];
  exercises?: Exercise[];
  hardwareTask?: HardwareTask;
  activities?: LevelActivity[];
  completionRule: CompletionRule;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  levels: Level[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
  chapters: Chapter[];
}

export interface PromptRequirementField {
  id: string;
  label: string;
  prompt?: string;
  type: "textarea" | "text" | "select" | "checkbox-group";
  required?: boolean;
  placeholder?: string;
  options?: ReadonlyArray<{ id: string; label: string }>;
}

export interface PromptTask {
  id: string;
  title: string;
  description: string;
  fields: PromptRequirementField[];
  template: string;
  clarifications?: Array<{
    field: string;
    question: string;
    options?: readonly string[];
  }>;
}
