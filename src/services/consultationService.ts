import { apiClient } from "@/lib/apiClient";
import type { Consultation, ConsultationContext } from "@/types/consultation";

export const consultationService = {
  getById: (id: string) => apiClient.get<Consultation>(`/consultations/${id}`),
  getContext: (id: string) => apiClient.get<ConsultationContext>(`/consultations/${id}/context`),
  listForPatient: (patientId: string) => apiClient.get<Consultation[]>(`/consultations/patient/${patientId}`),
  listForDoctor: (doctorId: string) => apiClient.get<Consultation[]>(`/consultations/doctor/${doctorId}`),
  getToday: () => apiClient.get<Consultation[]>("/consultations/today"),
  getUpcoming: () => apiClient.get<Consultation[]>("/consultations/upcoming"),
  schedule: (data: { patient_id: string; doctor_id: string; scheduled_at: string }) =>
    apiClient.post<Consultation>("/consultations", data),
  reschedule: (id: string, data: { scheduled_at: string }) =>
    apiClient.post<Consultation>(`/consultations/${id}/schedule`, data),
  addMeetLink: (id: string, meetLink: string) => apiClient.put<Consultation>(`/consultations/${id}/meet-link`, { meet_link: meetLink }),
  updateStatus: (id: string, status: string) => apiClient.put<Consultation>(`/consultations/${id}/status`, { status }),
};
