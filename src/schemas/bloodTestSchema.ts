import { z } from "zod";

const optionalPositive = z.number().nonnegative().optional();

export const bloodTestSchema = z.object({
  hba1c: optionalPositive,
  fasting_glucose: optionalPositive,
  total_cholesterol: optionalPositive,
  ldl: optionalPositive,
  hdl: optionalPositive,
  triglycerides: optionalPositive,
  alt: optionalPositive,
  ast: optionalPositive,
  creatinine: optionalPositive,
  egfr: optionalPositive,
});

export type BloodTestFormData = z.infer<typeof bloodTestSchema>;
