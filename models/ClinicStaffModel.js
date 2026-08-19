import mongoose from "mongoose";
const { Schema } = mongoose;

const clinicStaffSchema = new Schema(
  {
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["doctor", "receptionist", "nurse", "clinic_admin"],
      required: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    permissions: {
      type: [String],
      default: ["manage_queue", "create_vitals"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "invited"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent duplicate assignment in same clinic
clinicStaffSchema.index({ clinic_id: 1, user_id: 1 }, { unique: true });

const ClinicStaff = mongoose.model("ClinicStaff", clinicStaffSchema);
export default ClinicStaff;
