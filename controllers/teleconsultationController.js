import {
  createTeleconsultationService,
  getTeleconsultationByMeetingIdService,
  updateTeleconsultationStatusService,
} from "../services/teleconsultationService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const createTeleconsultation = async (req, res, next) => {
  try {
    const data = await createTeleconsultationService({
      doctorId: req.user.userId,
      clinicId: req.body.clinic_id || req.headers["x-clinic-id"],
      patientId: req.body.patient_id,
      appointmentId: req.body.appointment_id,
      callType: req.body.call_type,
    });
    return sendSuccess(res, "Teleconsultation session created successfully", data, 201);
  } catch (error) {
    next(error);
  }
};

export const getTeleconsultationByMeetingId = async (req, res, next) => {
  try {
    const session = await getTeleconsultationByMeetingIdService({
      meetingId: req.params.meetingId,
    });
    return sendSuccess(res, "Teleconsultation session fetched", { session }, 200);
  } catch (error) {
    next(error);
  }
};

export const updateTeleconsultationStatus = async (req, res, next) => {
  try {
    const session = await updateTeleconsultationStatusService({
      meetingId: req.params.meetingId,
      status: req.body.status,
      notes: req.body.notes,
    });
    return sendSuccess(res, "Teleconsultation status updated", { session }, 200);
  } catch (error) {
    next(error);
  }
};
