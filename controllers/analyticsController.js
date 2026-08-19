import { getClinicAnalyticsSummaryService } from "../services/analyticsService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const getClinicAnalyticsSummary = async (req, res, next) => {
  try {
    const data = await getClinicAnalyticsSummaryService({
      clinicId: req.query.clinic_id || req.headers["x-clinic-id"],
      timeframe: req.query.timeframe || "last_7_days",
    });
    return sendSuccess(res, "Clinic analytics fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};
