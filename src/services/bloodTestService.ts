import { apiClient } from "@/lib/apiClient";
import type { BloodTest } from "@/types/bloodTest";

export const bloodTestService = {
  getById: (id: string) => apiClient.get<BloodTest>(`/blood-tests/${id}`),
  listForProgramme: (programmeId: string) => apiClient.get<BloodTest[]>(`/blood-tests/programme/${programmeId}`),
  enterResults: (id: string, results: Partial<BloodTest>) => apiClient.put<BloodTest>(`/blood-tests/${id}/results`, results),
};
