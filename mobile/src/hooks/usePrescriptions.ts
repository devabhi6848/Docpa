import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionService } from "../services/prescription.service";
import { templateService } from "../services/template.service";
import { medicineService } from "../services/medicine.service";
import { useUIStore } from "../store/uiStore";
import { Prescription } from "../types/prescription";
import { RxTemplate } from "../types/template";
import { QUEUE_KEYS } from "./useQueue";

export const RX_KEYS = {
  all: ["prescriptions"] as const,
  byPatient: (patientId: string) => [...RX_KEYS.all, "patient", patientId] as const,
  detail: (id: string) => [...RX_KEYS.all, "detail", id] as const,
  templates: ["templates"] as const,
  medicineSearch: (q: string) => ["medicines", "search", q] as const,
};

export const usePatientPrescriptions = (patientId: string) => {
  return useQuery({
    queryKey: RX_KEYS.byPatient(patientId),
    queryFn: async () => {
      const res = await prescriptionService.getPatientPrescriptions(patientId);
      return res.data?.prescriptions || [];
    },
    enabled: Boolean(patientId),
  });
};

export const usePrescriptionDetail = (id: string) => {
  return useQuery({
    queryKey: RX_KEYS.detail(id),
    queryFn: async () => {
      const res = await prescriptionService.getPrescriptionById(id);
      return res.data?.prescription;
    },
    enabled: Boolean(id),
  });
};

export const useDoctorTemplates = () => {
  return useQuery({
    queryKey: RX_KEYS.templates,
    queryFn: async () => {
      const res = await templateService.getDoctorTemplates();
      return res.data?.templates || [];
    },
  });
};

export const useMedicineSearch = (query: string) => {
  return useQuery({
    queryKey: RX_KEYS.medicineSearch(query),
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];
      const res = await medicineService.searchMedicines(query);
      return res.data?.medicines || [];
    },
    enabled: Boolean(query && query.trim().length >= 2),
  });
};

export const useIssuePrescription = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: Partial<Prescription>) => {
      return prescriptionService.issuePrescription(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RX_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      showToast(`Prescription #${res.data?.prescription?.prescription_number} issued`, "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to issue prescription", "error");
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: Partial<RxTemplate>) => {
      return templateService.createTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RX_KEYS.templates });
      showToast("Rx Template saved", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to save template", "error");
    },
  });
};
