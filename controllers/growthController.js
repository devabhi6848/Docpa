import {
  recordGrowthMetricService,
  getPatientGrowthHistoryService,
} from "../services/growthService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const recordGrowthMetric = async (req, res, next) => {
  try {
    const record = await recordGrowthMetricService({
      patientId: req.params.patientId,
      clinicId: req.headers["x-clinic-id"] || req.body.clinic_id,
      data: req.body,
    });
    return sendSuccess(res, "Growth metrics recorded successfully", { record }, 201);
  } catch (error) {
    next(error);
  }
};

export const getPatientGrowthHistory = async (req, res, next) => {
  try {
    const data = await getPatientGrowthHistoryService({
      patientId: req.params.patientId,
    });
    return sendSuccess(res, "Patient growth history fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};
