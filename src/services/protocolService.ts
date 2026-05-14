import { apiClient } from "@/lib/apiClient";
import type { ProtocolTemplate, ProtocolStep, ProtocolVersion } from "@/types/protocol";

export const protocolService = {
  getTemplates: () => apiClient.get<ProtocolTemplate[]>("/admin/protocol/templates"),
  getTemplate: (id: string) => apiClient.get<ProtocolTemplate>(`/admin/protocol/templates/${id}`),
  getVersions: (id: string) => apiClient.get<ProtocolVersion[]>(`/admin/protocol/templates/${id}/versions`),
  getPublished: async () => {
    const result = await apiClient.get<ProtocolTemplate | ProtocolTemplate[]>("/admin/protocol/templates/published");
    return Array.isArray(result) ? result : [result];
  },
  addStep: (templateId: string, step: Partial<ProtocolStep>) =>
    apiClient.post<ProtocolStep>(`/admin/protocol/templates/${templateId}/steps`, step),
  updateStep: (templateId: string, stepId: string, data: Partial<ProtocolStep>) =>
    apiClient.put<ProtocolStep>(`/admin/protocol/templates/${templateId}/steps/${stepId}`, data),
  deleteStep: (templateId: string, stepId: string) =>
    apiClient.del<void>(`/admin/protocol/templates/${templateId}/steps/${stepId}`),
  reorderSteps: (templateId: string, stepIds: string[]) =>
    apiClient.put<void>(`/admin/protocol/templates/${templateId}/steps/reorder`, { step_ids: stepIds }),
  publish: (templateId: string) => apiClient.post<ProtocolTemplate>(`/admin/protocol/templates/${templateId}/publish`, {}),
};
