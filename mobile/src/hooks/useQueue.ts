import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "../services/queue.service";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { TokenStatus, VisitType, PriorityLevel } from "../types/queue";

export const QUEUE_KEYS = {
  all: ["queue"] as const,
  today: (clinicId?: string, doctorId?: string, date?: string) =>
    [...QUEUE_KEYS.all, "today", clinicId, doctorId, date] as const,
};

export const useTodayQueue = (params?: { doctorId?: string; date?: string }) => {
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const clinicId = activeClinic?._id;

  return useQuery({
    queryKey: QUEUE_KEYS.today(clinicId, params?.doctorId, params?.date),
    queryFn: async () => {
      const response = await queueService.getTodayQueue({
        clinic_id: clinicId,
        doctor_id: params?.doctorId,
        date: params?.date,
      });
      return response.data;
    },
    enabled: Boolean(clinicId),
    refetchInterval: 10000, // Live OPD polling every 10 seconds
  });
};

export const useUpdateTokenStatus = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async ({ tokenId, status }: { tokenId: string; status: TokenStatus }) => {
      return queueService.updateTokenStatus(tokenId, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      const statusLabels: Record<TokenStatus, string> = {
        waiting: "marked Waiting",
        with_doctor: "called With Doctor",
        completed: "marked Completed",
        cancelled: "Cancelled",
        no_show: "marked No Show",
      };
      showToast(`Token ${statusLabels[variables.status]}`, "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update token status", "error");
    },
  });
};

export const useGenerateToken = () => {
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  return useMutation({
    mutationFn: async (data: {
      clinic_id: string;
      doctor_id: string;
      patient_id: string;
      visit_type?: VisitType;
      priority?: PriorityLevel;
      chief_complaint?: string;
    }) => {
      return queueService.generateToken(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      const token = res.data?.token;
      showToast(`Token #${token?.token_number} generated successfully`, "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to generate token", "error");
    },
  });
};
