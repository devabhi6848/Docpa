import Patient from "../models/PatientModel.js";
import Vitals from "../models/VitalsModel.js";
import Appointment from "../models/AppointmentModel.js";
import Clinic from "../models/ClinicModel.js";
import { AppError } from "../utils/AppError.js";

/**
 * Ultra-fast patient search by mobile number, UHID, or patient name
 */
export const searchPatientsService = async ({ clinicId, query }) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cleanQ = query.trim();
  const searchRegex = new RegExp(cleanQ, "i");

  const filter = {
    clinic_id: clinicId,
    $or: [{ phone: { $regex: cleanQ } }, { uhid: searchRegex }, { name: searchRegex }],
  };

  const patients = await Patient.find(filter).sort({ last_visit_date: -1 }).limit(10);
  return patients;
};

/**
 * Register a new patient
 */
export const createPatientService = async ({ userId, data }) => {
  const clinic = await Clinic.findById(data.clinic_id);
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const patient = await Patient.create({
    ...data,
    created_by: userId,
    last_visit_date: new Date(),
  });

  return patient;
};

/**
 * Get patient profile, latest vitals, and visit history
 */
export const getPatientByIdService = async ({ patientId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const latestVitals = await Vitals.findOne({ patient_id: patientId }).sort({ createdAt: -1 });
  const totalVisits = await Appointment.countDocuments({
    patient_id: patientId,
    status: { $in: ["completed", "with_doctor", "waiting"] },
  });

  return {
    ...patient.toObject(),
    latest_vitals: latestVitals,
    total_visits: totalVisits || patient.total_visits,
  };
};

/**
 * Update patient details
 */
export const updatePatientService = async ({ patientId, data }) => {
  const patient = await Patient.findByIdAndUpdate(patientId, data, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  return patient;
};

/**
 * Record vitals for patient during triage or consultation
 */
export const recordVitalsService = async ({ patientId, userId, data }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const vitals = await Vitals.create({
    ...data,
    patient_id: patientId,
    clinic_id: patient.clinic_id,
    recorded_by: userId,
    recorded_at: new Date(),
  });

  // Link to active appointment if appointment_id provided
  if (data.appointment_id) {
    await Appointment.findByIdAndUpdate(data.appointment_id, {
      vitals_id: vitals._id,
    });
  }

  return vitals;
};

/**
 * Get vitals history for growth/health chart analysis
 */
export const getPatientVitalsTimelineService = async ({ patientId }) => {
  const timeline = await Vitals.find({ patient_id: patientId })
    .populate("recorded_by", "name role")
    .sort({ recorded_at: -1 })
    .limit(30);

  return timeline;
};
