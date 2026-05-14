export interface ClinicalNote {
  id: string;
  patient_id: string;
  author_id: string;
  note_type: "consultation" | "progress" | "alert" | "general";
  subject: string;
  body: string;
  created_at: string;
}
