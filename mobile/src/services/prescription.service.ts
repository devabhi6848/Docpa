import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { Prescription } from "../types/prescription";

export const prescriptionService = {
  async issuePrescription(data: Partial<Prescription>): Promise<ApiResponse<{ prescription: Prescription }>> {
    return apiClient.post(ENDPOINTS.PRESCRIPTIONS, data);
  },

  async getPrescriptionById(id: string): Promise<ApiResponse<{ prescription: Prescription }>> {
    return apiClient.get(ENDPOINTS.PRESCRIPTION_BY_ID(id));
  },

  async getPatientPrescriptions(patientId: string): Promise<ApiResponse<{ prescriptions: Prescription[] }>> {
    return apiClient.get(ENDPOINTS.PATIENT_PRESCRIPTIONS(patientId));
  },
};
