import mongoose from "mongoose";
const { Schema } = mongoose;

const teleconsultationSchema = new Schema(
  {
    meeting_id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    call_type: {
      type: String,
      enum: ["video", "audio"],
      default: "video",
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    scheduled_at: {
      type: Date,
      default: Date.now,
    },
    started_at: {
      type: Date,
    },
    ended_at: {
      type: Date,
    },
    room_url: {
      type: String,
      required: true,
    },
    doctor_notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Teleconsultation = mongoose.model("Teleconsultation", teleconsultationSchema);
export default Teleconsultation;
