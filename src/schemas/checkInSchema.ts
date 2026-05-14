import { z } from "zod";

export const checkInSchema = z.object({
  weight_kg: z.number().positive("Weight must be greater than 0"),
  fasting_glucose: z.number().nonnegative().optional(),
  doses_taken: z.number().int().nonnegative("Doses must be 0 or more"),
  side_effects: z.array(z.string()).default([]),
  appetite_level: z.number().int().min(1).max(5),
  energy_level: z.number().int().min(1).max(5),
  notes: z.string().max(300).optional(),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;
