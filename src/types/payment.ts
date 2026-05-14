export interface Payment {
  id: string;
  patient_id: string;
  order_id?: string;
  amount_inr: number;
  status: "pending" | "initiated" | "completed" | "failed" | "refunded";
  payment_method?: string;
  gateway_ref?: string;
  initiated_at: string;
  completed_at?: string;
}
