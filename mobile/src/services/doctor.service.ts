import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { DoctorProfile } from "../types/auth";

export const doctorService = {
  async getDoctorProfile(): Promise<ApiResponse<{ profile: DoctorProfile }>> {
    return apiClient.get(ENDPOINTS.DOCTOR_PROFILE);
  },

  async updateDoctorProfile(data: Partial<DoctorProfile>): Promise<ApiResponse<{ profile: DoctorProfile }>> {
    return apiClient.put(ENDPOINTS.DOCTOR_PROFILE, data);
  },
};
