import { z } from "zod";

export const orderSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  prescription_id: z.string().min(1, "Prescription is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  delivery_address: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
