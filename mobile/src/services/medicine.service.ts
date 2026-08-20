import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { Medicine } from "../types/medicine";

export const medicineService = {
  async searchMedicines(query: string): Promise<ApiResponse<{ medicines: Medicine[] }>> {
    return apiClient.get(ENDPOINTS.MEDICINES_SEARCH, {
      params: { q: query },
    });
  },

  async createCustomMedicine(data: Partial<Medicine>): Promise<ApiResponse<{ medicine: Medicine }>> {
    return apiClient.post(ENDPOINTS.MEDICINES, data);
  },
};
