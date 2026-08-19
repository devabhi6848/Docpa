import {
  issuePrescriptionService,
  getPrescriptionByIdService,
  getPatientPrescriptionsService,
} from "../services/prescriptionService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const issuePrescription = async (req, res, next) => {
  try {
    const prescription = await issuePrescriptionService({
      doctorId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Prescription issued successfully", { prescription }, 201);
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await getPrescriptionByIdService({
      prescriptionId: req.params.id,
    });
    return sendSuccess(res, "Prescription fetched successfully", { prescription }, 200);
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await getPatientPrescriptionsService({
      patientId: req.params.patientId,
    });
    return sendSuccess(res, "Patient prescriptions fetched successfully", { prescriptions }, 200);
  } catch (error) {
    next(error);
  }
};
