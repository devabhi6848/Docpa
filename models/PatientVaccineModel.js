import mongoose from "mongoose";
const { Schema } = mongoose;

const patientVaccineSchema = new Schema(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
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
    },
    vaccine_name: {
      type: String,
      required: true,
      trim: true,
    },
    disease_covered: {
      type: String,
      default: "",
    },
    age_milestone: {
      type: String,
      required: true, // e.g. "Birth", "6 Weeks", "10 Weeks", "14 Weeks", "6 Months", "9 Months", "12 Months", "15 Months", "18 Months", "2 Years", "4-6 Years", "10-12 Years"
    },
    dose_number: {
      type: String,
      default: "Dose 1", // e.g. "Dose 1", "Booster 1"
    },
    due_date: {
      type: Date,
      required: true,
    },
    given_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["upcoming", "due", "given", "missed"],
      default: "upcoming",
      index: true,
    },
    brand_name: {
      type: String,
      trim: true,
      default: "", // e.g. "Hexaxim", "Rotavac", "Prevenar 13", "Priorix"
    },
    batch_number: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for querying patient's vaccine schedule
patientVaccineSchema.index({ patient_id: 1, due_date: 1 });

const PatientVaccine = mongoose.model("PatientVaccine", patientVaccineSchema);
export default PatientVaccine;
