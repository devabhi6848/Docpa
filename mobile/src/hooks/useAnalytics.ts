import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";
import { useAuthStore } from "../store/authStore";

export const useClinicAnalytics = (timeframe: "today" | "last_7_days" | "last_30_days" = "last_7_days") => {
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const clinicId = activeClinic?._id;

  return useQuery({
    queryKey: ["analytics", clinicId, timeframe],
    queryFn: async () => {
      const res = await analyticsService.getClinicAnalytics({
        clinic_id: clinicId,
        timeframe,
      });
      return res.data;
    },
    enabled: Boolean(clinicId),
  });
};
