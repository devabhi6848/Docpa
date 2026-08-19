import Clinic from "../models/ClinicModel.js";
import ClinicStaff from "../models/ClinicStaffModel.js";
import { AppError } from "../utils/AppError.js";

/**
 * Multi-Tenant Isolation & Zero-Trust IDOR Guard
 * Verifies that the authenticated user has explicit rights to access or manipulate data within the target clinic.
 */
export const tenantGuard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError("Authentication required for tenant verification", 401));
    }

    // Super Admin has cross-tenant audit access
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      return next();
    }

    // Extract target clinicId from headers, params, query, or body
    const targetClinicId =
      req.headers["x-clinic-id"] ||
      req.params.clinicId ||
      req.params.clinic_id ||
      req.query.clinic_id ||
      req.body.clinic_id ||
      req.user.active_clinic_id;

    // If no clinic specified in request, continue (route-level logic may handle generic calls)
    if (!targetClinicId) {
      return next();
    }

    const clinicIdStr = targetClinicId.toString();

    // Check if user is clinic owner
    const ownedClinic = await Clinic.findOne({ _id: clinicIdStr, owner_id: req.user.id });
    if (ownedClinic) {
      req.tenantClinicId = clinicIdStr;
      return next();
    }

    // Check if user is active staff in this clinic
    const staffRecord = await ClinicStaff.findOne({
      clinic_id: clinicIdStr,
      user_id: req.user.id,
      status: "active",
    });

    if (staffRecord) {
      req.tenantClinicId = clinicIdStr;
      req.staffPermissions = staffRecord.permissions || [];
      return next();
    }

    // If neither owner nor active staff, block cross-tenant IDOR access
    return next(
      new AppError(
        "Zero-Trust Tenant Boundary: Access denied. You are not authorized to view or modify records belonging to this clinic.",
        403
      )
    );
  } catch (error) {
    next(error);
  }
};
