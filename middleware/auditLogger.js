import AuditLog from "../models/AuditLogModel.js";

/**
 * Asynchronous Audit Logger for Protected Health Information (PHI) & Sensitive Transactions
 * Dispatches asynchronously to avoid blocking the HTTP response cycle.
 */
export const logAuditEvent = async ({
  req,
  action,
  resourceType,
  resourceId = "",
  status = "success",
  details = {},
}) => {
  try {
    const ipAddress =
      req?.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      "";
    const userAgent = req?.headers["user-agent"] || "";

    const actorId = req?.user?.id || req?.user?._id || null;
    const actorName = req?.user?.name || "Anonymous/System";
    const actorRole = req?.user?.role || "anonymous";
    const clinicId = req?.tenantClinicId || req?.user?.active_clinic_id || null;

    // Fire-and-forget save
    AuditLog.create({
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      clinic_id: clinicId,
      action,
      resource_type: resourceType,
      resource_id: String(resourceId),
      ip_address: ipAddress,
      user_agent: userAgent,
      status,
      details,
    }).catch((err) => {
      console.error("[AUDIT LOG ERROR] Failed to record forensic audit log:", err.message);
    });
  } catch (err) {
    console.error("[AUDIT LOG ERROR] Unexpected exception in audit logger:", err.message);
  }
};
