import { apiClient } from "@/lib/apiClient";
import type { OverviewMetrics, ChartDataPoint, SideEffectData } from "@/types/analytics";

export const analyticsService = {
  overview: () => apiClient.get<OverviewMetrics>("/admin/analytics/overview"),
  enrolment: () => apiClient.get<ChartDataPoint[]>("/admin/analytics/enrolment"),
  weightByWeek: () => apiClient.get<ChartDataPoint[]>("/admin/analytics/weight-by-week"),
  adherenceTrend: () => apiClient.get<ChartDataPoint[]>("/admin/analytics/adherence-trend"),
  statusDistribution: () => apiClient.get<ChartDataPoint[]>("/admin/analytics/status-distribution"),
  glucoseTrend: () => apiClient.get<ChartDataPoint[]>("/admin/analytics/glucose-trend"),
  sideEffects: () => apiClient.get<SideEffectData[]>("/admin/analytics/side-effects"),
};
