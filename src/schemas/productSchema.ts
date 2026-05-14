import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  brand: z.string().min(1, "Brand is required"),
  category: z.enum(["medication", "supplement", "device", "consumable"]),
  price_inr: z.number().positive("Price must be greater than 0"),
  stock_count: z.number().int().nonnegative("Stock count must be 0 or more"),
});

export type ProductFormData = z.infer<typeof productSchema>;
