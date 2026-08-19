import {
  generateTokenService,
  getTodayQueueService,
  updateTokenStatusService,
  getTvDisplayQueueService,
} from "../services/queueService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const generateToken = async (req, res, next) => {
  try {
    const token = await generateTokenService({
      ...req.body,
      userId: req.user.userId,
    });
    return sendSuccess(res, "OPD Token generated successfully", { token }, 201);
  } catch (error) {
    next(error);
  }
};

export const getTodayQueue = async (req, res, next) => {
  try {
    const queueData = await getTodayQueueService({
      clinicId: req.query.clinic_id || req.headers["x-clinic-id"],
      doctorId: req.query.doctor_id,
      date: req.query.date,
    });
    return sendSuccess(res, "Today's OPD queue fetched successfully", queueData, 200);
  } catch (error) {
    next(error);
  }
};

export const updateTokenStatus = async (req, res, next) => {
  try {
    const token = await updateTokenStatusService({
      tokenId: req.params.id,
      status: req.body.status,
      userId: req.user.userId,
    });
    return sendSuccess(res, `Token status updated to ${req.body.status}`, { token }, 200);
  } catch (error) {
    next(error);
  }
};

export const getTvDisplayQueue = async (req, res, next) => {
  try {
    const displayData = await getTvDisplayQueueService({
      clinicId: req.params.clinicId,
    });
    return sendSuccess(res, "TV display queue fetched successfully", displayData, 200);
  } catch (error) {
    next(error);
  }
};
