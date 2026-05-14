export interface Prescription {
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  programme_id: string | null;
  consultation_id: string | null;
  programme_step_id: string | null;
  medication: string;
  dose_value: number;
  dose_unit: string;
  frequency: string;
  duration_weeks: number;
  special_instructions: string | null;
  next_escalation_dose: number | null;
  next_escalation_unit: string | null;
  status: string;
  created_at: string | null;
  superseded_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
}
