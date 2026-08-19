import Patient from "../models/PatientModel.js";
import Clinic from "../models/ClinicModel.js";
import Appointment from "../models/AppointmentModel.js";
import Prescription from "../models/PrescriptionModel.js";
import PatientVaccine from "../models/PatientVaccineModel.js";
import Invoice from "../models/InvoiceModel.js";
import { AppError } from "../utils/AppError.js";

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Aggregates complete patient digital health record for patient web portal
 */
export const getPatientPortalDataService = async ({ patientId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const clinic = await Clinic.findById(patient.clinic_id).select(
    "name code tagline phone email address working_hours"
  );

  const todayDate = getTodayDateString();

  // 1. Live OPD Queue Status for Today
  let liveQueueStatus = null;
  const todayAppointment = await Appointment.findOne({
    patient_id: patientId,
    date: todayDate,
  }).populate("doctor_id", "name avatar_url");

  if (todayAppointment) {
    const activeConsulting = await Appointment.findOne({
      clinic_id: todayAppointment.clinic_id,
      doctor_id: todayAppointment.doctor_id._id,
      date: todayDate,
      status: "with_doctor",
    });

    const aheadCount = await Appointment.countDocuments({
      clinic_id: todayAppointment.clinic_id,
      doctor_id: todayAppointment.doctor_id._id,
      date: todayDate,
      status: "waiting",
      token_number: { $lt: todayAppointment.token_number },
    });

    liveQueueStatus = {
      token_code: todayAppointment.token_code,
      status: todayAppointment.status,
      doctor_name: todayAppointment.doctor_id?.name || "Doctor",
      current_calling_token: activeConsulting?.token_code || "Starting Soon",
      patients_ahead: aheadCount,
      estimated_wait_minutes: aheadCount * 10,
    };
  }

  // 2. Past Prescriptions
  const prescriptions = await Prescription.find({ patient_id: patientId })
    .populate("doctor_id", "name")
    .sort({ createdAt: -1 });

  // 3. Vaccines
  const vaccines = await PatientVaccine.find({ patient_id: patientId }).sort({ due_date: 1 });
  const vaccineSummary = {
    total: vaccines.length,
    given: vaccines.filter((v) => v.status === "given").length,
    due: vaccines.filter((v) => v.status === "due").length,
    upcoming: vaccines.filter((v) => v.status === "upcoming").length,
  };

  // 4. Invoices
  const invoices = await Invoice.find({ patient_id: patientId }).sort({ createdAt: -1 });

  return {
    patient,
    clinic,
    live_queue_status: liveQueueStatus,
    prescriptions,
    vaccines: {
      summary: vaccineSummary,
      list: vaccines,
    },
    invoices,
  };
};
