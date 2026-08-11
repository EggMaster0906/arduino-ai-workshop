import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);

export const promptCoachRequestSchema = z.object({
  taskId: text(100),
  requirements: z.record(z.string(), z.unknown()),
  anonymousSessionId: z.string().uuid().optional()
});

export const missingFieldSchema = z.object({
  field: text(100),
  question: text(500)
});

export const promptCoachResponseSchema = z.object({
  complete: z.boolean(),
  missingFields: z.array(missingFieldSchema),
  structuredRequirement: z.record(z.string(), z.unknown()),
  prompt: z.string().nullable()
});

export const codeRequestSchema = z.object({
  prompt: text(12_000),
  taskId: text(100),
  anonymousSessionId: z.string().uuid().optional()
});

export const codeResponseSchema = z.object({
  message: text(30_000),
  code: z.string().max(30_000),
  language: z.literal("cpp")
});

export const debugRequestSchema = z.object({
  originalPrompt: text(12_000),
  code: z.string().max(30_000),
  problem: text(6_000),
  errorMessage: z.string().max(8_000).default(""),
  hardwareState: z.string().max(6_000).default(""),
  attemptedFixes: z.string().max(6_000).default(""),
  anonymousSessionId: z.string().uuid().optional()
});

export const debugResponseSchema = z.object({
  analysis: text(20_000),
  checks: z.array(text(2_000)).min(1).max(5),
  suggestedCode: z.string().max(30_000).nullable().optional()
});

export type PromptCoachRequest = z.infer<typeof promptCoachRequestSchema>;
export type PromptCoachResponse = z.infer<typeof promptCoachResponseSchema>;
export type CodeRequest = z.infer<typeof codeRequestSchema>;
export type CodeResponse = z.infer<typeof codeResponseSchema>;
export type DebugRequest = z.infer<typeof debugRequestSchema>;
export type DebugResponse = z.infer<typeof debugResponseSchema>;

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
