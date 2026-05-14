export interface BloodTest {
  id: string;
  programme_id: string;
  patient_id: string;
  ordered_at: string;
  completed_at?: string;
  status: "ordered" | "collected" | "results_ready";
  hba1c?: number;
  fasting_glucose?: number;
  total_cholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  alt?: number;
  ast?: number;
  creatinine?: number;
  egfr?: number;
}
