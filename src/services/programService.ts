import { apiClient } from "@/lib/apiClient";
import type { Programme, ProgrammeStep } from "@/types/programme";

export const programService = {
  getActive: () => apiClient.get<Programme>("/programmes/active"),
  getById: (id: string) => apiClient.get<Programme>(`/programmes/${id}`),
  getSteps: (id: string) => apiClient.get<ProgrammeStep[]>(`/programmes/${id}/steps`),
  getHistory: () => apiClient.get<Programme[]>("/programmes/history"),
  create: (templateId: string) => apiClient.post<Programme>("/programmes", { template_id: templateId }),
  completeStep: (programmeId: string, stepId: string) =>
    apiClient.put<ProgrammeStep>(`/programmes/${programmeId}/steps/${stepId}/status`, { status: "completed" }),
  skipStep: (programmeId: string, stepId: string) =>
    apiClient.put<ProgrammeStep>(`/programmes/${programmeId}/steps/${stepId}/status`, { status: "skipped" }),
};
