import { apiClient } from "@/lib/apiClient";
import type { Patient, PatientFlag, PatientSummary } from "@/types/patient";

export const patientService = {
  getMe: () => apiClient.get<Patient>("/patients/me"),
  getById: (id: string) => apiClient.get<Patient>(`/patients/${id}`),
  listForDoctor: (doctorId: string) => apiClient.get<Patient[]>(`/patients/doctor/${doctorId}`),
  getSummary: (doctorId: string) => apiClient.get<PatientSummary>(`/patients/doctor/${doctorId}/summary`),
  updateProfile: (idOrData: string | Partial<Patient>, data?: Partial<Patient>) => {
    if (typeof idOrData === "string") return apiClient.put<Patient>(`/patients/me/profile`, data!);
    return apiClient.put<Patient>("/patients/me/profile", idOrData);
  },
  setFlag: (id: string, flag: { flag_type: string; reason: string }) =>
    apiClient.post<PatientFlag>(`/patients/${id}/flags`, flag),
  clearFlag: (id: string, flagId: string) => apiClient.del<void>(`/patients/${id}/flags/${flagId}`),
  getFlags: (id: string) => apiClient.get<PatientFlag[]>(`/patients/${id}/flags`),
};
