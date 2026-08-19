import mongoose from "mongoose";
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
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
    vitals_id: {
      type: Schema.Types.ObjectId,
      ref: "Vitals",
    },
    token_number: {
      type: Number,
      required: true,
    },
    token_code: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "with_doctor", "completed", "cancelled", "no_show"],
      default: "waiting",
      index: true,
    },
    visit_type: {
      type: String,
      enum: ["new_visit", "follow_up", "emergency", "report_review", "vaccination"],
      default: "new_visit",
    },
    priority: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    chief_complaint: {
      type: String,
      trim: true,
      default: "",
    },
    arrival_time: {
      type: Date,
      default: Date.now,
    },
    consultation_start_time: {
      type: Date,
    },
    consultation_end_time: {
      type: Date,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound index to quickly fetch today's active queue for a clinic/doctor
appointmentSchema.index({ clinic_id: 1, doctor_id: 1, date: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
