import { z } from "zod";

export const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  specialisation: z.enum(["endocrinology", "obesity_medicine", "general_practice", "nutrition"]),
  phone: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;
