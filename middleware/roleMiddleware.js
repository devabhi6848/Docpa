import { AppError } from "../utils/AppError.js";
import Clinic from "../models/ClinicModel.js";
import ClinicStaff from "../models/ClinicStaffModel.js";

/**
 * Middleware to restrict route access to specific user roles
 * @param {...string} roles - e.g. 'doctor', 'clinic_admin', 'admin', 'receptionist'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("User unauthenticated or missing role", 401));
    }

    // System Admins always bypass role checks
    if (req.user.role === "admin") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied: You do not have permission (${req.user.role}) to access this resource`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to ensure the authenticated user belongs to the specified clinic
 */
export const requireClinicAccess = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const clinicId =
        req.params.clinicId ||
        req.params.id ||
        req.headers["x-clinic-id"] ||
        req.body.clinic_id ||
        req.query.clinic_id;

      if (!clinicId) {
        return next(new AppError("Clinic ID is required for this operation", 400));
      }

      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return next(new AppError("Clinic not found", 404));
      }

      // Check if user is the clinic owner
      if (clinic.owner_id.toString() === req.user.userId) {
        req.clinic = clinic;
        req.clinicRole = "owner";
        return next();
      }

      // Check if user is an active staff member in the clinic
      const staffRecord = await ClinicStaff.findOne({
        clinic_id: clinicId,
        user_id: req.user.userId,
        status: "active",
      });

      if (!staffRecord) {
        return next(
          new AppError("Access denied: You are not an authorized staff member of this clinic", 403)
        );
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(staffRecord.role)) {
        return next(
          new AppError(
            `Access denied: Clinic role (${staffRecord.role}) insufficient for this action`,
            403
          )
        );
      }

      req.clinic = clinic;
      req.clinicRole = staffRecord.role;
      req.staffRecord = staffRecord;
      next();
    } catch (error) {
      next(error);
    }
  };
};
