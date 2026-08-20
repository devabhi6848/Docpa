import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { Clinic, ClinicStaff } from "../types/clinic";
import { User } from "../types/auth";

export const clinicService = {
  async getMyClinics(): Promise<ApiResponse<{ clinics: Clinic[] }>> {
    return apiClient.get(ENDPOINTS.MY_CLINICS);
  },

  async switchActiveClinic(clinicId: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post(ENDPOINTS.SWITCH_ACTIVE_CLINIC, { clinic_id: clinicId });
  },

  async createClinic(data: Partial<Clinic>): Promise<ApiResponse<{ clinic: Clinic }>> {
    return apiClient.post(ENDPOINTS.CLINICS, data);
  },

  async getClinicById(id: string): Promise<ApiResponse<{ clinic: Clinic }>> {
    return apiClient.get(ENDPOINTS.CLINIC_BY_ID(id));
  },

  async updateClinic(id: string, data: Partial<Clinic>): Promise<ApiResponse<{ clinic: Clinic }>> {
    return apiClient.put(ENDPOINTS.CLINIC_BY_ID(id), data);
  },

  async getClinicStaff(clinicId: string): Promise<ApiResponse<{ staff: ClinicStaff[] }>> {
    return apiClient.get(ENDPOINTS.CLINIC_STAFF(clinicId));
  },

  async addStaff(
    clinicId: string,
    data: {
      identifier: string;
      role: "doctor" | "receptionist" | "nurse" | "clinic_admin";
      designation?: string;
      permissions?: string[];
    }
  ): Promise<ApiResponse<{ staff: ClinicStaff }>> {
    return apiClient.post(ENDPOINTS.CLINIC_STAFF(clinicId), data);
  },

  async updateStaff(
    clinicId: string,
    staffId: string,
    data: Partial<ClinicStaff>
  ): Promise<ApiResponse<{ staff: ClinicStaff }>> {
    return apiClient.put(ENDPOINTS.CLINIC_STAFF_MEMBER(clinicId, staffId), data);
  },

  async removeStaff(clinicId: string, staffId: string): Promise<ApiResponse<null>> {
    return apiClient.delete(ENDPOINTS.CLINIC_STAFF_MEMBER(clinicId, staffId));
  },
};
