import Teleconsultation from "../models/TeleconsultationModel.js";
import Patient from "../models/PatientModel.js";
import Clinic from "../models/ClinicModel.js";
import User from "../models/UserModel.js";
import { AppError } from "../utils/AppError.js";

const generateMeetingId = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DOCPA-CARE-${Date.now().toString().slice(-6)}-${rand}`;
};

/**
 * Create an instant or scheduled video teleconsultation room
 */
export const createTeleconsultationService = async ({
  doctorId,
  clinicId,
  patientId,
  appointmentId,
  callType = "video",
}) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const clinic = await Clinic.findById(clinicId);
  const doctor = await User.findById(doctorId);

  const meetingId = generateMeetingId();
  const roomUrl = `https://meet.jit.si/${meetingId}#config.prejoinPageEnabled=false&userInfo.displayName="Dr. ${encodeURIComponent(doctor?.name || "Doctor")}"`;

  const session = await Teleconsultation.create({
    meeting_id: meetingId,
    clinic_id: clinicId,
    doctor_id: doctorId,
    patient_id: patientId,
    appointment_id: appointmentId || undefined,
    call_type: callType,
    status: "scheduled",
    room_url: roomUrl,
  });

  const clientPortalUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/teleconsultation/room/${meetingId}`;

  // WhatsApp Invite Generator
  const cleanPhone = patient.phone ? patient.phone.replace(/\D/g, "").slice(-10) : "";
  let whatsappInvite = "";
  if (cleanPhone) {
    const msg =
      `*Hello ${patient.name},*\n\n` +
      `Dr. ${doctor?.name || "Doctor"} from *${clinic?.name || "Docpa Clinic"}* is ready for your online video teleconsultation.\n\n` +
      `🎥 *Join Video Consultation Room:* ${clientPortalUrl}\n\n` +
      `_Please ensure you have a working camera and microphone enabled._ 👨‍⚕️🩺`;
    whatsappInvite = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  return {
    session,
    meeting_url: clientPortalUrl,
    whatsapp_invite: whatsappInvite,
  };
};

/**
 * Get teleconsultation session details with patient & clinic info
 */
export const getTeleconsultationByMeetingIdService = async ({ meetingId }) => {
  const session = await Teleconsultation.findOne({ meeting_id: meetingId })
    .populate("clinic_id")
    .populate("doctor_id", "name email phone avatar_url")
    .populate("patient_id")
    .populate("appointment_id");

  if (!session) {
    throw new AppError("Teleconsultation room not found", 404);
  }

  return session;
};

/**
 * Update teleconsultation status (started, completed)
 */
export const updateTeleconsultationStatusService = async ({ meetingId, status, notes }) => {
  const session = await Teleconsultation.findOne({ meeting_id: meetingId });
  if (!session) {
    throw new AppError("Teleconsultation room not found", 404);
  }

  session.status = status;
  if (status === "in_progress" && !session.started_at) {
    session.started_at = new Date();
  } else if (status === "completed") {
    session.ended_at = new Date();
  }
  if (notes) session.doctor_notes = notes;

  await session.save();
  return session;
};
