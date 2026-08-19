import mongoose from "mongoose";
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    actor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    actor_name: {
      type: String,
      default: "System",
    },
    actor_role: {
      type: String,
      default: "system",
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      index: true,
    },
    action: {
      type: String,
      enum: [
        "VIEW_PHI",
        "REGISTER_PATIENT",
        "UPDATE_PATIENT",
        "RECORD_VITALS",
        "ISSUE_RX",
        "MODIFY_RX",
        "GENERATE_INVOICE",
        "ADMIN_ACTION",
        "AUTH_LOCKOUT",
        "SECURITY_EVENT",
      ],
      required: true,
      index: true,
    },
    resource_type: {
      type: String,
      enum: ["Patient", "Prescription", "Invoice", "Appointment", "User", "Clinic", "Auth"],
      required: true,
    },
    resource_id: {
      type: String,
      default: "",
    },
    ip_address: {
      type: String,
      default: "",
    },
    user_agent: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed", "denied"],
      default: "success",
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Immutable logs: created once, never updated
);

// Compound Index for high-speed forensic audits by clinic and time
auditLogSchema.index({ clinic_id: 1, createdAt: -1 });
auditLogSchema.index({ actor_id: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
