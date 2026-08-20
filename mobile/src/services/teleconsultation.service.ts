import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { Teleconsultation, TeleconsultationStatus } from "../types/teleconsultation";

export const teleconsultationService = {
  async createTeleconsultation(data: {
    clinic_id?: string;
    patient_id: string;
    appointment_id?: string;
    call_type?: "video" | "audio";
  }): Promise<ApiResponse<{ session: Teleconsultation }>> {
    return apiClient.post(ENDPOINTS.TELECONSULTATIONS, data);
  },

  async getTeleconsultationByMeetingId(meetingId: string): Promise<ApiResponse<{ session: Teleconsultation }>> {
    return apiClient.get(ENDPOINTS.TELECONSULTATION_ROOM(meetingId));
  },

  async updateTeleconsultationStatus(
    meetingId: string,
    data: { status: TeleconsultationStatus; notes?: string }
  ): Promise<ApiResponse<{ session: Teleconsultation }>> {
    return apiClient.patch(ENDPOINTS.TELECONSULTATION_STATUS(meetingId), data);
  },
};
