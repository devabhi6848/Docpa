import mongoose from "mongoose";
const { Schema } = mongoose;

const rxMedicineItemSchema = new Schema(
  {
    name: { type: String, required: true },
    generic_name: { type: String, default: "" },
    dosage_form: { type: String, default: "Tablet" },
    dose: { type: String, default: "1 Tab" }, // e.g. "1 Tab", "5 ml", "1 Sachet"
    frequency: { type: String, default: "1-0-1" },
    timing: { type: String, default: "After Food" },
    duration_days: { type: Number, default: 5 },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const rxTemplateSchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
    },
    title: {
      type: String,
      required: [true, "Template title is required"],
      trim: true,
    },
    specialization: {
      type: String,
      default: "General Medicine",
    },
    chief_complaints: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: [String],
      default: [],
    },
    medicines: {
      type: [rxMedicineItemSchema],
      default: [],
    },
    investigations: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const RxTemplate = mongoose.model("RxTemplate", rxTemplateSchema);
export default RxTemplate;
