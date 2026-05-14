import { z } from "zod";

export const treatmentPlanSchema = z.object({
  goals: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  lifestyle_notes: z.string().max(1000).optional(),
});

export type TreatmentPlanFormData = z.infer<typeof treatmentPlanSchema>;
