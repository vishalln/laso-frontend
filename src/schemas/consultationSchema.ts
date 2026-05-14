import { z } from "zod";

export const consultationSchema = z.object({
  doctor_id: z.string().uuid("Invalid doctor ID"),
  scheduled_at: z.string().min(1, "Scheduled date is required"),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;
