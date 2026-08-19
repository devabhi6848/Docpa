import Clinic from "../models/ClinicModel.js";
import ClinicStaff from "../models/ClinicStaffModel.js";
import User from "../models/UserModel.js";
import { AppError } from "../utils/AppError.js";

/**
 * Create a new clinic and associate creator as owner/staff
 */
export const createClinicService = async ({ userId, data }) => {
  const clinic = await Clinic.create({
    ...data,
    owner_id: userId,
  });

  // Automatically add creator to ClinicStaff as clinic_admin/doctor
  const user = await User.findById(userId);
  const staffRole = user?.role === "doctor" ? "doctor" : "clinic_admin";

  await ClinicStaff.create({
    clinic_id: clinic._id,
    user_id: userId,
    role: staffRole,
    designation: staffRole === "doctor" ? "Lead Consultant" : "Clinic Administrator",
    permissions: ["manage_queue", "create_vitals", "manage_billing", "write_rx", "manage_settings"],
    status: "active",
  });

  // Set as active clinic if none is set
  if (!user.active_clinic_id) {
    user.active_clinic_id = clinic._id;
    await user.save();
  }

  return clinic;
};

/**
 * Get all clinics the user owns or is an active staff member of
 */
export const getUserClinicsService = async ({ userId }) => {
  // 1. Owned clinics
  const ownedClinics = await Clinic.find({ owner_id: userId, is_active: true }).lean();

  // 2. Staff clinics
  const staffRecords = await ClinicStaff.find({ user_id: userId, status: "active" })
    .populate("clinic_id")
    .lean();

  const clinicMap = new Map();

  ownedClinics.forEach((c) => {
    clinicMap.set(c._id.toString(), {
      ...c,
      user_clinic_role: "owner",
    });
  });

  staffRecords.forEach((sr) => {
    if (sr.clinic_id && sr.clinic_id.is_active) {
      const cid = sr.clinic_id._id.toString();
      if (!clinicMap.has(cid)) {
        clinicMap.set(cid, {
          ...sr.clinic_id,
          user_clinic_role: sr.role,
          designation: sr.designation,
          permissions: sr.permissions,
        });
      }
    }
  });

  return Array.from(clinicMap.values());
};

/**
 * Get single clinic details
 */
export const getClinicByIdService = async ({ clinicId }) => {
  const clinic = await Clinic.findById(clinicId).populate("owner_id", "name email phone avatar_url");
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }
  const staffCount = await ClinicStaff.countDocuments({ clinic_id: clinicId, status: "active" });

  return {
    ...clinic.toObject(),
    staff_count: staffCount,
  };
};

/**
 * Update clinic profile and letterhead settings
 */
export const updateClinicService = async ({ clinicId, data }) => {
  const clinic = await Clinic.findByIdAndUpdate(clinicId, data, {
    new: true,
    runValidators: true,
  });

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  return clinic;
};

/**
 * Add / Invite a staff member to the clinic by email or phone
 */
export const addStaffService = async ({ clinicId, identifier, role, designation, permissions }) => {
  // Find user by email or phone
  const isEmail = identifier.includes("@");
  const query = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };
  
  let targetUser = await User.findOne(query);

  if (!targetUser) {
    // If user does not exist yet, auto-register as invited staff
    targetUser = await User.create({
      ...(isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }),
      name: designation || `Staff (${role})`,
      role: role === "doctor" ? "doctor" : "receptionist",
    });
  }

  // Check if staff record already exists in this clinic
  let staffRecord = await ClinicStaff.findOne({ clinic_id: clinicId, user_id: targetUser._id });

  if (staffRecord) {
    staffRecord.role = role;
    staffRecord.designation = designation || staffRecord.designation;
    staffRecord.permissions = permissions || staffRecord.permissions;
    staffRecord.status = "active";
    await staffRecord.save();
  } else {
    staffRecord = await ClinicStaff.create({
      clinic_id: clinicId,
      user_id: targetUser._id,
      role,
      designation: designation || (role === "doctor" ? "Consultant" : "Front Desk Receptionist"),
      permissions: permissions || (role === "doctor" ? ["manage_queue", "write_rx"] : ["manage_queue", "create_vitals", "manage_billing"]),
      status: "active",
    });
  }

  const populatedStaff = await ClinicStaff.findById(staffRecord._id).populate("user_id", "name email phone avatar_url role");
  return populatedStaff;
};

/**
 * Get all staff members in clinic
 */
export const getClinicStaffService = async ({ clinicId }) => {
  const staff = await ClinicStaff.find({ clinic_id: clinicId, status: { $ne: "inactive" } })
    .populate("user_id", "name email phone avatar_url role")
    .sort({ createdAt: -1 });

  return staff;
};

/**
 * Update staff member role or status
 */
export const updateStaffService = async ({ staffId, data }) => {
  const updatedStaff = await ClinicStaff.findByIdAndUpdate(staffId, data, {
    new: true,
  }).populate("user_id", "name email phone avatar_url role");

  if (!updatedStaff) {
    throw new AppError("Staff member record not found", 404);
  }

  return updatedStaff;
};

/**
 * Remove staff member from clinic
 */
export const removeStaffService = async ({ staffId }) => {
  const staff = await ClinicStaff.findByIdAndDelete(staffId);
  if (!staff) {
    throw new AppError("Staff member record not found", 404);
  }
  return true;
};

/**
 * Switch user's active clinic
 */
export const switchActiveClinicService = async ({ userId, clinicId }) => {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { active_clinic_id: clinicId },
    { new: true }
  ).populate("active_clinic_id");

  return user;
};
