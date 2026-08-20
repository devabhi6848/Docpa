import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { AppointmentToken, TodayQueueResponse, TokenStatus, VisitType, PriorityLevel } from "../types/queue";

export const queueService = {
  async generateToken(data: {
    clinic_id: string;
    doctor_id: string;
    patient_id: string;
    visit_type?: VisitType;
    priority?: PriorityLevel;
    chief_complaint?: string;
  }): Promise<ApiResponse<{ token: AppointmentToken }>> {
    return apiClient.post(ENDPOINTS.GENERATE_TOKEN, data);
  },

  async getTodayQueue(params?: {
    clinic_id?: string;
    doctor_id?: string;
    date?: string;
  }): Promise<ApiResponse<TodayQueueResponse>> {
    return apiClient.get(ENDPOINTS.TODAY_QUEUE, { params });
  },

  async updateTokenStatus(
    tokenId: string,
    status: TokenStatus
  ): Promise<ApiResponse<{ token: AppointmentToken }>> {
    return apiClient.patch(ENDPOINTS.TOKEN_STATUS(tokenId), { status });
  },

  async getTvDisplayQueue(clinicId: string): Promise<ApiResponse<TodayQueueResponse>> {
    return apiClient.get(ENDPOINTS.TV_DISPLAY(clinicId));
  },
};
