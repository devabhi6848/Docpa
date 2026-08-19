import mongoose from "mongoose";
const { Schema } = mongoose;

const timingSlotSchema = new Schema(
  {
    start_time: { type: String, default: "09:00" }, // e.g. "09:00"
    end_time: { type: String, default: "13:00" },   // e.g. "13:00"
  },
  { _id: false }
);

const dayTimingSchema = new Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    is_open: { type: Boolean, default: true },
    slots: [timingSlotSchema],
  },
  { _id: false }
);

const defaultTimings = [
  { day: "Monday", is_open: true, slots: [{ start_time: "09:00", end_time: "13:00" }, { start_time: "17:00", end_time: "20:00" }] },
  { day: "Tuesday", is_open: true, slots: [{ start_time: "09:00", end_time: "13:00" }, { start_time: "17:00", end_time: "20:00" }] },
  { day: "Wednesday", is_open: true, slots: [{ start_time: "09:00", end_time: "13:00" }, { start_time: "17:00", end_time: "20:00" }] },
  { day: "Thursday", is_open: true, slots: [{ start_time: "09:00", end_time: "13:00" }, { start_time: "17:00", end_time: "20:00" }] },
  { day: "Friday", is_open: true, slots: [{ start_time: "09:00", end_time: "13:00" }, { start_time: "17:00", end_time: "20:00" }] },
  { day: "Saturday", is_open: true, slots: [{ start_time: "09:00", end_time: "14:00" }] },
  { day: "Sunday", is_open: false, slots: [] },
];

const clinicSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Clinic name is required"],
      trim: true,
      maxlength: 150,
    },
    tagline: {
      type: String,
      trim: true,
      default: "Healthcare & Multispeciality Clinic",
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    emergency_phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      landmark: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    consultation_fee: {
      type: Number,
      default: 500,
      min: 0,
    },
    follow_up_fee: {
      type: Number,
      default: 300,
      min: 0,
    },
    follow_up_validity_days: {
      type: Number,
      default: 7,
      min: 0,
    },
    token_prefix: {
      type: String,
      default: "T",
      uppercase: true,
      maxlength: 5,
    },
    letterhead_settings: {
      show_header: { type: Boolean, default: true },
      header_title: { type: String, default: "" },
      header_subtitle: { type: String, default: "" },
      logo_url: { type: String, default: "" },
      footer_text: {
        type: String,
        default: "Valid for medical record. Please bring this prescription for follow-up.",
      },
      paper_size: {
        type: String,
        enum: ["A4", "A5", "thermal"],
        default: "A4",
      },
      header_space_mm: {
        type: Number,
        default: 0, // In mm, if using pre-printed letterhead
      },
      show_qr_code: { type: Boolean, default: true },
    },
    timings: {
      type: [dayTimingSchema],
      default: defaultTimings,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate unique clinic code if not specified
clinicSchema.pre("save", function () {
  if (!this.code) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.code = `DOC-${randomSuffix}`;
  }
});

const Clinic = mongoose.model("Clinic", clinicSchema);
export default Clinic;
