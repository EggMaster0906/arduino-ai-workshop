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

export type PromptCoachRequest = z.infer<typeof promptCoachRequestSchema>;
export type PromptCoachResponse = z.infer<typeof promptCoachResponseSchema>;

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
