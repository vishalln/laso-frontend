import { z } from "zod";

export const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dose_value: z.number().positive("Dose must be greater than 0"),
  dose_unit: z.string().min(1, "Dose unit is required"),
  frequency: z.enum(["once_daily", "twice_daily", "thrice_daily", "weekly", "as_needed"]),
  duration_weeks: z.number().int().positive("Duration must be at least 1 week"),
  special_instructions: z.string().max(500).optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
