import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse } from "../types/api";
import { DailyCollectionResponse, Invoice } from "../types/invoice";

export const invoiceService = {
  async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<{ invoice: Invoice }>> {
    return apiClient.post(ENDPOINTS.INVOICES, data);
  },

  async getInvoiceById(id: string): Promise<ApiResponse<{ invoice: Invoice }>> {
    return apiClient.get(ENDPOINTS.INVOICE_BY_ID(id));
  },

  async getDailyCollection(params?: {
    clinic_id?: string;
    date?: string;
  }): Promise<ApiResponse<DailyCollectionResponse>> {
    return apiClient.get(ENDPOINTS.DAILY_COLLECTION, { params });
  },
};
