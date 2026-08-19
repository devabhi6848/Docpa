import {
  issuePrescriptionService,
  getPrescriptionByIdService,
  getPatientPrescriptionsService,
} from "../services/prescriptionService.js";
import { logAuditEvent } from "../middleware/auditLogger.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const issuePrescription = async (req, res, next) => {
  try {
    const doctorId = req.user.id || req.user.userId;
    const prescription = await issuePrescriptionService({
      doctorId,
      data: req.body,
    });

    logAuditEvent({
      req,
      action: "ISSUE_RX",
      resourceType: "Prescription",
      resourceId: prescription._id,
      details: {
        prescription_number: prescription.prescription_number,
        patient_id: prescription.patient_id?._id || prescription.patient_id,
        diagnosis: prescription.diagnosis,
      },
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

    logAuditEvent({
      req,
      action: "VIEW_PHI",
      resourceType: "Prescription",
      resourceId: req.params.id,
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

    logAuditEvent({
      req,
      action: "VIEW_PHI",
      resourceType: "Patient",
      resourceId: req.params.patientId,
      details: { action_description: "Patient prescription timeline history query" },
    });

    return sendSuccess(res, "Patient prescriptions fetched successfully", { prescriptions }, 200);
  } catch (error) {
    next(error);
  }
};
