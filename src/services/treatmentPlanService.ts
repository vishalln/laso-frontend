import { apiClient } from "@/lib/apiClient";

export interface TreatmentPlan {
  programme_id: string;
  goals: string[];
  medications: string[];
  lifestyle_notes?: string;
  updated_at: string;
}

export const treatmentPlanService = {
  getForProgramme: (programmeId: string) => apiClient.get<TreatmentPlan>(`/treatment-plans/programme/${programmeId}`),
  update: (programmeId: string, data: Partial<TreatmentPlan>) =>
    apiClient.put<TreatmentPlan>(`/treatment-plans/programme/${programmeId}`, data),
};
