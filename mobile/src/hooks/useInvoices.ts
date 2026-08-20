import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "../services/invoice.service";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { Invoice } from "../types/invoice";

export const INVOICE_KEYS = {
  all: ["invoices"] as const,
  daily: (clinicId?: string, date?: string) => [...INVOICE_KEYS.all, "daily", clinicId, date] as const,
  detail: (id: string) => [...INVOICE_KEYS.all, "detail", id] as const,
};

export const useDailyCollection = (date?: string) => {
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const clinicId = activeClinic?._id;

  return useQuery({
    queryKey: INVOICE_KEYS.daily(clinicId, date),
    queryFn: async () => {
      const res = await invoiceService.getDailyCollection({ clinic_id: clinicId, date });
      return res.data;
    },
    enabled: Boolean(clinicId),
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: Partial<Invoice>) => {
      return invoiceService.createInvoice(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      showToast(`Invoice #${res.data?.invoice?.invoice_number} created`, "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to create invoice", "error");
    },
  });
};
