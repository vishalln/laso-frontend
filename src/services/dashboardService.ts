import { apiClient } from "@/lib/apiClient";

export interface NextAction {
  type: string;
  title: string;
  description: string;
  action_url?: string;
  priority: "low" | "medium" | "high";
}

export const dashboardService = {
  getNextAction: () => apiClient.get<NextAction>("/dashboard/next-action"),
};
