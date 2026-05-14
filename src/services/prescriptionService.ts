import { apiClient } from "@/lib/apiClient";
import type { Prescription } from "@/types/prescription";

export const prescriptionService = {
  create: (data: Omit<Prescription, "id" | "prescribed_at" | "status">) =>
    apiClient.post<Prescription>("/prescriptions", data),
  listForPatient: (patientId: string) => apiClient.get<Prescription[]>(`/prescriptions/patient/${patientId}`),
  getActive: (patientId: string) => apiClient.get<Prescription>(`/prescriptions/active/${patientId}`),
  cancel: (id: string) => apiClient.put<Prescription>(`/prescriptions/${id}/cancel`, {}),
};
