import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { GrowthHistoryResponse, GrowthRecord } from "../types/growth";

export const growthService = {
  async recordGrowthMetric(
    patientId: string,
    data: Partial<GrowthRecord>
  ): Promise<ApiResponse<{ record: GrowthRecord }>> {
    return apiClient.post(ENDPOINTS.GROWTH_RECORD(patientId), data);
  },

  async getPatientGrowthHistory(patientId: string): Promise<ApiResponse<GrowthHistoryResponse>> {
    return apiClient.get(ENDPOINTS.GROWTH_RECORD(patientId));
  },
};
