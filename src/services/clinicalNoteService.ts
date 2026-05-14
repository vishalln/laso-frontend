import { apiClient } from "@/lib/apiClient";
import type { ClinicalNote } from "@/types/clinicalNote";

export const clinicalNoteService = {
  create: (data: { patient_id: string; note_type: string; subject: string; body: string }) =>
    apiClient.post<ClinicalNote>("/clinical-notes", data),
  listForPatient: (patientId: string) => apiClient.get<ClinicalNote[]>(`/clinical-notes/patient/${patientId}`),
};
