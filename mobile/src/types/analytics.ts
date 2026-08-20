export interface AnalyticsSummary {
  timeframe: "today" | "last_7_days" | "last_30_days";
  total_patients: number;
  total_consultations: number;
  total_revenue: number;
  avg_wait_time_minutes: number;
  revenue_by_method: Record<string, number>;
  daily_trends?: Array<{
    date: string;
    patients: number;
    revenue: number;
  }>;
}
