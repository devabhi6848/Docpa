import Prescription from "../models/PrescriptionModel.js";
import Appointment from "../models/AppointmentModel.js";
import Clinic from "../models/ClinicModel.js";
import Patient from "../models/PatientModel.js";
import DoctorProfile from "../models/DoctorProfileModel.js";
import { AppError } from "../utils/AppError.js";

const generateRxNumber = async () => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `RX-${dateStr}-${random}`;
};

/**
 * Issue and save a digital prescription
 */
export const issuePrescriptionService = async ({ doctorId, data }) => {
  const clinic = await Clinic.findById(data.clinic_id);
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const patient = await Patient.findById(data.patient_id);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const rxNumber = await generateRxNumber();

  const prescription = await Prescription.create({
    ...data,
    prescription_number: rxNumber,
    doctor_id: doctorId,
    status: "issued",
  });

  // If tied to an active appointment token, mark appointment as completed
  if (data.appointment_id) {
    await Appointment.findByIdAndUpdate(data.appointment_id, {
      status: "completed",
      consultation_end_time: new Date(),
    });
  }

  const populated = await Prescription.findById(prescription._id)
    .populate("clinic_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("patient_id");

  return populated;
};

/**
 * Get single prescription with full clinic letterhead and doctor profile
 */
export const getPrescriptionByIdService = async ({ prescriptionId }) => {
  const prescription = await Prescription.findById(prescriptionId)
    .populate("clinic_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("patient_id");

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  // Attach doctor's clinical profile (degrees, registration number, signature)
  const doctorProfile = await DoctorProfile.findOne({ user_id: prescription.doctor_id._id });

  return {
    ...prescription.toObject(),
    doctor_profile: doctorProfile || null,
  };
};

/**
 * Get all prescriptions of a patient for medical history timeline
 */
export const getPatientPrescriptionsService = async ({ patientId }) => {
  const prescriptions = await Prescription.find({ patient_id: patientId })
    .populate("clinic_id", "name code phone address")
    .populate("doctor_id", "name")
    .sort({ createdAt: -1 });

  return prescriptions;
};
