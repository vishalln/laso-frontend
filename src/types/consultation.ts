export interface Consultation {
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  programme_id: string | null;
  programme_step_id: string | null;
  type: string;
  duration_minutes: number;
  status: string;
  scheduled_at: string | null;
  meet_link: string | null;
  cancel_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConsultationContext {
  consultation: Consultation;
  patient_summary: {
    name: string;
    current_week: number;
    latest_weight_kg?: number;
    latest_glucose?: number;
    adherence_pct?: number;
  };
  recent_check_ins: unknown[];
  recent_blood_tests: unknown[];
}
