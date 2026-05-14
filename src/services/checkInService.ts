import { apiClient } from "@/lib/apiClient";
import type { WeeklyCheckIn, AdherenceStats } from "@/types/checkIn";

export const checkInService = {
  submit: (data: Omit<WeeklyCheckIn, "id" | "submitted_at">) =>
    apiClient.post<WeeklyCheckIn>("/check-ins", data),
  listForProgramme: (programmeId: string) => apiClient.get<WeeklyCheckIn[]>(`/check-ins/programme/${programmeId}`),
  getLatest: (patientId: string) => apiClient.get<WeeklyCheckIn>(`/check-ins/latest/${patientId}`),
  getAdherence: (programmeId: string) => apiClient.get<AdherenceStats>(`/check-ins/adherence/${programmeId}`),
};
