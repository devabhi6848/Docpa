import mongoose from "mongoose";
const { Schema } = mongoose;

const doctorProfileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "Dr.",
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ["MBBS"],
    },
    specializations: {
      type: [String],
      default: ["General Physician"],
    },
    medical_registration_number: {
      type: String,
      trim: true,
      default: "",
    },
    state_medical_council: {
      type: String,
      trim: true,
      default: "",
    },
    experience_years: {
      type: Number,
      min: 0,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    signature_url: {
      type: String,
      default: "",
    },
    default_rx_notes: {
      type: String,
      default: "Take plenty of rest and stay hydrated. Return if symptoms worsen.",
    },
  },
  { timestamps: true }
);

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);
export default DoctorProfile;
