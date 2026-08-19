import DoctorProfile from "../models/DoctorProfileModel.js";
import User from "../models/UserModel.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get or initialize doctor profile
 */
export const getDoctorProfileService = async ({ userId }) => {
  let profile = await DoctorProfile.findOne({ user_id: userId }).populate("user_id", "name email phone avatar_url role active_clinic_id");

  if (!profile) {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    // Auto-create default profile for doctor
    profile = await DoctorProfile.create({
      user_id: userId,
      title: "Dr.",
      qualifications: ["MBBS"],
      specializations: ["General Physician"],
    });

    profile = await DoctorProfile.findById(profile._id).populate("user_id", "name email phone avatar_url role active_clinic_id");
  }

  return profile;
};

/**
 * Update doctor's qualifications, council reg no, and digital signature
 */
export const updateDoctorProfileService = async ({ userId, data }) => {
  const profile = await DoctorProfile.findOneAndUpdate(
    { user_id: userId },
    { ...data, user_id: userId },
    { new: true, upsert: true, runValidators: true }
  ).populate("user_id", "name email phone avatar_url role active_clinic_id");

  return profile;
};
