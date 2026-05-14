import { z } from "zod";

export const clinicalNoteSchema = z.object({
  note_type: z.enum(["consultation", "progress", "alert", "general"]),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required").max(5000),
});

export type ClinicalNoteFormData = z.infer<typeof clinicalNoteSchema>;
