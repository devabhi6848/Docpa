import {
  getDoctorProfileService,
  updateDoctorProfileService,
} from "../services/doctorService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const getDoctorProfile = async (req, res, next) => {
  try {
    const profile = await getDoctorProfileService({ userId: req.user.userId });
    return sendSuccess(res, "Doctor profile fetched successfully", { profile }, 200);
  } catch (error) {
    next(error);
  }
};

export const updateDoctorProfile = async (req, res, next) => {
  try {
    const profile = await updateDoctorProfileService({
      userId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Doctor profile updated successfully", { profile }, 200);
  } catch (error) {
    next(error);
  }
};
