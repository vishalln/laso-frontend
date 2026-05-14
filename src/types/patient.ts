export interface Patient {
  patient_id: string;
  email: string;
  name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  height_cm: number | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_state: string | null;
  address_pincode: string | null;
  status: string;
  assigned_doctor_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientFlag {
  flag_id: string;
  patient_id: string;
  flag_type: string;
  reason: string;
  created_by: string;
  resolved_by: string | null;
  created_at: string | null;
  resolved_at: string | null;
}

export interface PatientSummary {
  patient: Patient;
  current_week: number;
  latest_weight_kg?: number;
  weight_change_kg?: number;
  adherence_pct: number;
  next_consultation?: string;
  active_flags: PatientFlag[];
}
