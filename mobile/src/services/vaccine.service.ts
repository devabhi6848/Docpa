import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { PatientVaccine, VaccineScheduleResponse } from "../types/vaccine";

export const vaccineService = {
  async getPatientVaccineSchedule(patientId: string): Promise<ApiResponse<VaccineScheduleResponse>> {
    return apiClient.get(ENDPOINTS.VACCINE_SCHEDULE(patientId));
  },

  async markVaccineGiven(
    vaccineRecordId: string,
    data: {
      given_date?: string;
      brand_name?: string;
      batch_number?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<{ record: PatientVaccine }>> {
    return apiClient.patch(ENDPOINTS.MARK_VACCINE_GIVEN(vaccineRecordId), data);
  },
};
