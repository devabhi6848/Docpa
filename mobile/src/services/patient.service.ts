import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { Patient, Vitals } from "../types/patient";

export const patientService = {
  async searchPatients(params: {
    query?: string;
    clinicId?: string;
  }): Promise<ApiResponse<{ patients: Patient[] }>> {
    return apiClient.get(ENDPOINTS.PATIENT_SEARCH, {
      params: {
        q: params.query || "",
        clinic_id: params.clinicId,
      },
    });
  },

  async createPatient(data: Partial<Patient>): Promise<ApiResponse<{ patient: Patient }>> {
    return apiClient.post(ENDPOINTS.PATIENTS, data);
  },

  async getPatientById(id: string): Promise<ApiResponse<{ patient: Patient }>> {
    return apiClient.get(ENDPOINTS.PATIENT_BY_ID(id));
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<ApiResponse<{ patient: Patient }>> {
    return apiClient.put(ENDPOINTS.PATIENT_BY_ID(id), data);
  },

  async recordVitals(
    patientId: string,
    data: Partial<Vitals> & { appointment_id?: string }
  ): Promise<ApiResponse<{ vitals: Vitals }>> {
    return apiClient.post(ENDPOINTS.PATIENT_VITALS(patientId), data);
  },

  async getPatientVitalsTimeline(patientId: string): Promise<ApiResponse<{ timeline: Vitals[] }>> {
    return apiClient.get(ENDPOINTS.PATIENT_VITALS(patientId));
  },
};
