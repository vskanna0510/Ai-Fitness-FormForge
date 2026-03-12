import { z } from "zod";

export const RepEventSchema = z.object({
  time: z.string().datetime(),
  sessionId: z.string(),
  repNumber: z.number().int().min(1),
  formScore: z.number().min(0).max(100),
  keypointsJson: z.record(z.any()),
  errors: z.array(z.string())
});

export type RepEvent = z.infer<typeof RepEventSchema>;

