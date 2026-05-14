export interface Task {
  task_id: string;
  patient_id: string | null;
  task_type: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_to_doctor: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DoctorPendingAction {
  id: string;
  type: "review_check_in" | "review_blood_test" | "consultation_prep" | "prescription_renewal";
  patient_id: string;
  patient_name: string;
  description: string;
  priority: "low" | "medium" | "high";
  created_at: string;
}
