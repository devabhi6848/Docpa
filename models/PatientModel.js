import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    uhid: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, "Patient phone number is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    dob: {
      type: Date,
    },
    age_years: {
      type: Number,
      min: 0,
      default: 0,
    },
    age_months: {
      type: Number,
      min: 0,
      max: 11,
      default: 0,
    },
    age_days: {
      type: Number,
      min: 0,
      max: 30,
      default: 0,
    },
    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
      default: "unknown",
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronic_conditions: {
      type: [String],
      default: [],
    },
    guardian_name: {
      type: String,
      trim: true,
      default: "", // Father/Mother/Spouse
    },
    guardian_relationship: {
      type: String,
      enum: ["Father", "Mother", "Spouse", "Guardian", "Self", "Other"],
      default: "Self",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    last_visit_date: {
      type: Date,
      default: Date.now,
    },
    total_visits: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Auto-generate UHID if not present
patientSchema.pre("save", function () {
  if (!this.uhid) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.uhid = `UHID-${randomSuffix}`;
  }
});

// Compound Index for fast lookup by clinic and phone
patientSchema.index({ clinic_id: 1, phone: 1 });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
