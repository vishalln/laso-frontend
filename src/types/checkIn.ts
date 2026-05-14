export interface WeeklyCheckIn {
  check_in_id: string;
  patient_id: string;
  programme_id: string;
  programme_step_id: string | null;
  week_number: number;
  weight_kg: number;
  fasting_glucose: number | null;
  doses_taken: number;
  doses_scheduled: number;
  side_effects: unknown;
  appetite_level: string;
  energy_level: string;
  notes: string | null;
  submitted_at: string | null;
}

export interface AdherenceStats {
  total_weeks: number;
  submitted_weeks: number;
  adherence_pct: number;
  average_doses_taken: number;
}
