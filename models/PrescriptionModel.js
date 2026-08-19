import mongoose from "mongoose";
const { Schema } = mongoose;

const prescribedMedicineSchema = new Schema(
  {
    name: { type: String, required: true },
    generic_name: { type: String, default: "" },
    dosage_form: { type: String, default: "Tablet" },
    dose: { type: String, default: "1 Tab" },
    frequency: { type: String, default: "1-0-1" },
    timing: { type: String, default: "After Food" },
    duration_days: { type: Number, default: 5 },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const vitalsSnapshotSchema = new Schema(
  {
    bp_systolic: Number,
    bp_diastolic: Number,
    pulse_rate: Number,
    temperature_f: Number,
    spo2_percent: Number,
    weight_kg: Number,
    height_cm: Number,
    bmi: Number,
    head_circumference_cm: Number,
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    prescription_number: {
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
      index: true,
    },
    vitals_snapshot: {
      type: vitalsSnapshotSchema,
      default: {},
    },
    chief_complaints: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: [String],
      default: [],
    },
    clinical_notes: {
      type: String,
      default: "",
    },
    medicines: {
      type: [prescribedMedicineSchema],
      default: [],
    },
    investigations: {
      type: [String],
      default: [],
    },
    general_advice: {
      type: String,
      default: "Take medications on time. Drink plenty of water and rest well.",
    },
    follow_up_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "issued", "shared_whatsapp"],
      default: "issued",
    },
    pdf_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for querying patient's medical history
prescriptionSchema.index({ patient_id: 1, createdAt: -1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
