import mongoose from "mongoose";
const { Schema } = mongoose;

const vitalsSchema = new Schema(
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
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      index: true,
    },
    recorded_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recorded_at: {
      type: Date,
      default: Date.now,
    },
    bp_systolic: {
      type: Number,
      min: 40,
      max: 300,
    },
    bp_diastolic: {
      type: Number,
      min: 20,
      max: 200,
    },
    pulse_rate: {
      type: Number,
      min: 20,
      max: 250,
    },
    temperature_f: {
      type: Number,
      min: 90,
      max: 110,
    },
    spo2_percent: {
      type: Number,
      min: 40,
      max: 100,
    },
    respiratory_rate: {
      type: Number,
      min: 5,
      max: 100,
    },
    weight_kg: {
      type: Number,
      min: 0.5,
      max: 500,
    },
    height_cm: {
      type: Number,
      min: 20,
      max: 250,
    },
    bmi: {
      type: Number,
      min: 5,
      max: 90,
    },
    head_circumference_cm: {
      type: Number,
      min: 10,
      max: 100, // Important for Pediatric tracking
    },
    rbs_mg_dl: {
      type: Number,
      min: 10,
      max: 1000,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-calculate BMI before saving
vitalsSchema.pre("save", function () {
  if (this.weight_kg && this.height_cm) {
    const heightInMeters = this.height_cm / 100;
    this.bmi = parseFloat((this.weight_kg / (heightInMeters * heightInMeters)).toFixed(1));
  }
});

const Vitals = mongoose.model("Vitals", vitalsSchema);
export default Vitals;
