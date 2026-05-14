export interface ProtocolStep {
  id: string;
  template_id: string;
  title: string;
  step_type: "consultation" | "blood_test" | "check_in" | "medication_start" | "dose_change";
  week_offset: number;
  order: number;
  duration_minutes?: number;
  is_recurring: boolean;
  auto_activate_rule: "manual" | "auto" | "on_previous_complete";
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: "draft" | "published" | "archived";
  steps: ProtocolStep[];
  created_at: string;
  published_at?: string;
}

export interface ProtocolVersion {
  version: number;
  status: "draft" | "published" | "archived";
  published_at?: string;
  step_count: number;
}
