import mongoose from "mongoose";
const { Schema } = mongoose;

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine brand name is required"],
      trim: true,
      index: true,
    },
    generic_name: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    dosage_form: {
      type: String,
      enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Suspension",
        "Drops",
        "Injection",
        "Ointment",
        "Cream",
        "Gel",
        "Inhaler",
        "Rotacap",
        "Respules",
        "Mouthwash",
        "Powder",
        "Sachet",
        "Lotion",
        "Ear Drops",
        "Eye Drops",
        "Nasal Spray",
      ],
      default: "Tablet",
    },
    strength: {
      type: String,
      trim: true,
      default: "", // e.g. "625mg", "250mg/5ml", "40mg"
    },
    default_frequency: {
      type: String,
      default: "1-0-1", // "1-0-1", "1-0-0", "1-1-1", "0-0-1", "SOS", "Once Daily"
    },
    default_timing: {
      type: String,
      enum: [
        "After Food",
        "Before Food",
        "With Food",
        "Empty Stomach",
        "At Bedtime",
        "As Needed (SOS)",
        "In the Morning",
      ],
      default: "After Food",
    },
    default_duration_days: {
      type: Number,
      min: 1,
      default: 5,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    is_custom: {
      type: Boolean,
      default: false,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
  },
  { timestamps: true }
);

// Compound text index for lightning fast multi-word drug & generic composition search
medicineSchema.index({ name: "text", generic_name: "text" });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
