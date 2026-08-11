import { z } from "zod";

export const STUDENT_STATE_VERSION = 1;

export interface PromptHistoryItem {
  id: string;
  taskId: string;
  createdAt: string;
  rawRequirements: Record<string, unknown>;
  prompt: string;
}

export interface DebugHistoryItem {
  id: string;
  taskId?: string;
  createdAt: string;
  problem: string;
  result?: string;
}

export interface StudentState {
  version: number;
  anonymousSessionId: string;
  student: {
    displayName: string;
    studentCode?: string;
    group?: string;
  };
  courseId: string;
  currentLevelId: string;
  completedLevels: string[];
  answers: Record<string, unknown>;
  hardwareConfirmations: Record<string, boolean>;
  completedActivities: string[];
  promptHistory: PromptHistoryItem[];
  debugHistory: DebugHistoryItem[];
}

export const studentStateSchema = z.object({
  version: z.literal(STUDENT_STATE_VERSION),
  anonymousSessionId: z.string().uuid(),
  student: z.object({
    displayName: z.string().trim().min(1).max(80),
    studentCode: z.string().trim().max(40).optional(),
    group: z.string().trim().max(40).optional()
  }),
  courseId: z.string().min(1).max(100),
  currentLevelId: z.string().min(1).max(100),
  completedLevels: z.array(z.string().min(1).max(100)),
  answers: z.record(z.string(), z.unknown()),
  hardwareConfirmations: z.record(z.string(), z.boolean()),
  completedActivities: z.array(z.string().min(1).max(100)),
  promptHistory: z.array(
    z.object({
      id: z.string().min(1),
      taskId: z.string().min(1),
      createdAt: z.string().datetime(),
      rawRequirements: z.record(z.string(), z.unknown()),
      prompt: z.string()
    })
  ),
  debugHistory: z.array(
    z.object({
      id: z.string().min(1),
      taskId: z.string().optional(),
      createdAt: z.string().datetime(),
      problem: z.string(),
      result: z.string().optional()
    })
  )
});

export function parseStudentState(value: unknown): StudentState | null {
  const result = studentStateSchema.safeParse(value);
  return result.success ? result.data : null;
}
