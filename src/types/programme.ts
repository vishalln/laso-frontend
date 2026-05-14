export interface ProgrammeStep {
  step_id: string;
  programme_id: string;
  template_step_id: string | null;
  title: string;
  step_type: string;
  week_offset: number;
  duration_minutes: number;
  is_recurring: boolean;
  auto_activate_rule: string;
  is_flagged: boolean;
  status: "pending" | "active" | "completed" | "skipped";
  sort_order: number;
  activated_at: string | null;
  completed_at: string | null;
  skip_reason: string | null;
  created_at: string | null;
}

export interface Programme {
  programme_id: string;
  patient_id: string;
  doctor_id: string | null;
  template_id: string;
  template_version: number;
  name: string;
  status: "active" | "paused" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  paused_at_step_id: string | null;
  pause_reason: string | null;
  cancel_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
}
