import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { RxTemplate } from "../types/template";

export const templateService = {
  async getDoctorTemplates(): Promise<ApiResponse<{ templates: RxTemplate[] }>> {
    return apiClient.get(ENDPOINTS.TEMPLATES);
  },

  async createTemplate(data: Partial<RxTemplate>): Promise<ApiResponse<{ template: RxTemplate }>> {
    return apiClient.post(ENDPOINTS.TEMPLATES, data);
  },

  async updateTemplate(id: string, data: Partial<RxTemplate>): Promise<ApiResponse<{ template: RxTemplate }>> {
    return apiClient.put(ENDPOINTS.TEMPLATE_BY_ID(id), data);
  },

  async deleteTemplate(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(ENDPOINTS.TEMPLATE_BY_ID(id));
  },
};
