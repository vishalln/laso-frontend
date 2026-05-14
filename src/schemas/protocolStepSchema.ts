import { z } from "zod";

export const protocolStepSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  step_type: z.enum(["consultation", "blood_test", "check_in", "medication_start", "dose_change"]),
  week_offset: z.number().int().nonnegative("Week offset must be 0 or more"),
  duration_minutes: z.number().int().positive().optional(),
  is_recurring: z.boolean().optional(),
  auto_activate_rule: z.enum(["manual", "auto", "on_previous_complete"]),
});

export type ProtocolStepFormData = z.infer<typeof protocolStepSchema>;
