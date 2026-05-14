export interface OverviewMetrics {
  total_patients: number;
  active_programmes: number;
  consultations_this_week: number;
  average_adherence_pct: number;
  average_weight_loss_kg: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface SideEffectData {
  name: string;
  count: number;
  percentage: number;
}
