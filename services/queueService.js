import Appointment from "../models/AppointmentModel.js";
import Clinic from "../models/ClinicModel.js";
import Patient from "../models/PatientModel.js";
import Vitals from "../models/VitalsModel.js";
import { AppError } from "../utils/AppError.js";

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generate sequential OPD token for today
 */
export const generateTokenService = async ({
  clinicId,
  doctorId,
  patientId,
  visitType = "new_visit",
  priority = "normal",
  chiefComplaint = "",
  userId,
}) => {
  const todayDate = getTodayDateString();

  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  // Find latest token number for today in this clinic & doctor
  const lastAppointment = await Appointment.findOne({
    clinic_id: clinicId,
    doctor_id: doctorId,
    date: todayDate,
  }).sort({ token_number: -1 });

  const nextTokenNumber = lastAppointment ? lastAppointment.token_number + 1 : 1;
  const prefix = clinic.token_prefix || "T";
  const tokenCode = `${prefix}-${String(nextTokenNumber).padStart(2, "0")}`;

  // Link latest vitals if available
  const latestVitals = await Vitals.findOne({ patient_id: patientId }).sort({ createdAt: -1 });

  const appointment = await Appointment.create({
    clinic_id: clinicId,
    doctor_id: doctorId,
    patient_id: patientId,
    vitals_id: latestVitals?._id || null,
    token_number: nextTokenNumber,
    token_code: tokenCode,
    date: todayDate,
    status: "waiting",
    visit_type: visitType,
    priority,
    chief_complaint: chiefComplaint,
    arrival_time: new Date(),
    created_by: userId,
  });

  // Update patient last visit date
  patient.last_visit_date = new Date();
  patient.total_visits = (patient.total_visits || 0) + 1;
  await patient.save();

  const populated = await Appointment.findById(appointment._id)
    .populate("patient_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("vitals_id");

  return populated;
};

/**
 * Get Today's Live OPD Queue with status breakdown
 */
export const getTodayQueueService = async ({ clinicId, doctorId, date }) => {
  const queryDate = date || getTodayDateString();

  const filter = {
    clinic_id: clinicId,
    date: queryDate,
  };

  if (doctorId) {
    filter.doctor_id = doctorId;
  }

  const queue = await Appointment.find(filter)
    .populate("patient_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("vitals_id")
    .sort({ token_number: 1 });

  // Separate into active categories
  const waiting = queue.filter((t) => t.status === "waiting");
  const withDoctor = queue.filter((t) => t.status === "with_doctor");
  const completed = queue.filter((t) => t.status === "completed");
  const other = queue.filter((t) => ["cancelled", "no_show"].includes(t.status));

  return {
    date: queryDate,
    total_tokens: queue.length,
    counts: {
      waiting: waiting.length,
      with_doctor: withDoctor.length,
      completed: completed.length,
      other: other.length,
    },
    current_consultation: withDoctor[0] || null,
    queue: {
      waiting,
      with_doctor: withDoctor,
      completed,
      other,
      all: queue,
    },
  };
};

/**
 * Update token status (Calling patient, completing, or cancelling)
 */
export const updateTokenStatusService = async ({ tokenId, status, userId }) => {
  const appointment = await Appointment.findById(tokenId);
  if (!appointment) {
    throw new AppError("Appointment token not found", 404);
  }

  appointment.status = status;

  if (status === "with_doctor") {
    appointment.consultation_start_time = new Date();
  } else if (status === "completed") {
    appointment.consultation_end_time = new Date();
  }

  await appointment.save();

  const populated = await Appointment.findById(tokenId)
    .populate("patient_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("vitals_id");

  return populated;
};

/**
 * Fast endpoint for OPD Waiting Room TV Screen
 */
export const getTvDisplayQueueService = async ({ clinicId }) => {
  const todayDate = getTodayDateString();

  const clinic = await Clinic.findById(clinicId).select("name tagline logo_url");
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const activeTokens = await Appointment.find({
    clinic_id: clinicId,
    date: todayDate,
    status: "with_doctor",
  })
    .populate("patient_id", "name gender age_years")
    .populate("doctor_id", "name");

  const upcomingTokens = await Appointment.find({
    clinic_id: clinicId,
    date: todayDate,
    status: "waiting",
  })
    .populate("patient_id", "name gender age_years")
    .populate("doctor_id", "name")
    .sort({ token_number: 1 })
    .limit(6);

  return {
    clinic,
    date: todayDate,
    calling_now: activeTokens,
    upcoming: upcomingTokens,
  };
};
