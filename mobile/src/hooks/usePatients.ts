import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patient.service";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { Patient, Vitals } from "../types/patient";

export const PATIENT_KEYS = {
  all: ["patients"] as const,
  search: (query?: string, clinicId?: string) => [...PATIENT_KEYS.all, "search", query, clinicId] as const,
  detail: (id: string) => [...PATIENT_KEYS.all, "detail", id] as const,
  vitals: (id: string) => [...PATIENT_KEYS.all, "vitals", id] as const,
};

export const usePatientSearch = (query: string) => {
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const clinicId = activeClinic?._id;

  return useQuery({
    queryKey: PATIENT_KEYS.search(query, clinicId),
    queryFn: async () => {
      const res = await patientService.searchPatients({ query, clinicId });
      return res.data?.patients || [];
    },
    enabled: Boolean(clinicId),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const usePatientDetail = (patientId: string) => {
  return useQuery({
    queryKey: PATIENT_KEYS.detail(patientId),
    queryFn: async () => {
      const res = await patientService.getPatientById(patientId);
      return res.data?.patient;
    },
    enabled: Boolean(patientId),
  });
};

export const usePatientVitalsTimeline = (patientId: string) => {
  return useQuery({
    queryKey: PATIENT_KEYS.vitals(patientId),
    queryFn: async () => {
      const res = await patientService.getPatientVitalsTimeline(patientId);
      return res.data?.timeline || [];
    },
    enabled: Boolean(patientId),
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      return patientService.createPatient(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
      showToast(`Patient ${res.data?.patient?.name} registered successfully`, "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to register patient", "error");
    },
  });
};

export const useRecordVitals = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async ({
      patientId,
      vitals,
    }: {
      patientId: string;
      vitals: Partial<Vitals> & { appointment_id?: string };
    }) => {
      return patientService.recordVitals(patientId, vitals);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.vitals(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.detail(variables.patientId) });
      showToast("Vitals recorded successfully", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to record vitals", "error");
    },
  });
};
