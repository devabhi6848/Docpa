import {
  searchPatientsService,
  createPatientService,
  getPatientByIdService,
  updatePatientService,
  recordVitalsService,
  getPatientVitalsTimelineService,
} from "../services/patientService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const searchPatients = async (req, res, next) => {
  try {
    const patients = await searchPatientsService({
      clinicId: req.query.clinic_id || req.headers["x-clinic-id"],
      query: req.query.q || "",
    });
    return sendSuccess(res, "Patients searched successfully", { patients }, 200);
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const patient = await createPatientService({
      userId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Patient registered successfully", { patient }, 201);
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await getPatientByIdService({ patientId: req.params.id });
    return sendSuccess(res, "Patient fetched successfully", { patient }, 200);
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await updatePatientService({
      patientId: req.params.id,
      data: req.body,
    });
    return sendSuccess(res, "Patient updated successfully", { patient }, 200);
  } catch (error) {
    next(error);
  }
};

export const recordVitals = async (req, res, next) => {
  try {
    const vitals = await recordVitalsService({
      patientId: req.params.id,
      userId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Vitals recorded successfully", { vitals }, 201);
  } catch (error) {
    next(error);
  }
};

export const getPatientVitalsTimeline = async (req, res, next) => {
  try {
    const timeline = await getPatientVitalsTimelineService({ patientId: req.params.id });
    return sendSuccess(res, "Vitals timeline fetched successfully", { timeline }, 200);
  } catch (error) {
    next(error);
  }
};
