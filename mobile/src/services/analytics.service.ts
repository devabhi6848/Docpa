import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { AnalyticsSummary } from "../types/analytics";

export const analyticsService = {
  async getClinicAnalytics(params?: {
    clinic_id?: string;
    timeframe?: "today" | "last_7_days" | "last_30_days";
  }): Promise<ApiResponse<AnalyticsSummary>> {
    return apiClient.get(ENDPOINTS.ANALYTICS_SUMMARY, { params });
  },
};
