import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwtUtil.js";
import { hashSecret } from "../utils/cryptoUtil.js";
import { verifyGoogleIdToken } from "./googleAuthService.js";
import { verifyOtpService } from "./otpService.js";
import { AppError } from "../utils/AppError.js";
import crypto from "crypto";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

import Clinic from "../models/ClinicModel.js";
import DoctorProfile from "../models/DoctorProfileModel.js";
import ClinicStaff from "../models/ClinicStaffModel.js";

/**
 * Register user with Password
 */
export const registerUserService = async ({
  email,
  phone,
  password,
  role = "doctor",
  name,
  clinic_name,
  specialization,
  registration_number,
  consultation_fee,
}) => {
  const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : undefined;
  const cleanPhone = phone && phone.trim() ? phone.trim() : undefined;

  if (!cleanEmail && !cleanPhone) {
    throw new AppError("At least one of email or phone is required", 400);
  }

  if (cleanEmail) {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }
  }

  if (cleanPhone) {
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      throw new AppError("User with this phone number already exists", 400);
    }
  }

  const password_hash = await hashPassword(password);

  const user = await User.create({
    name: name || (cleanEmail ? cleanEmail.split("@")[0] : "Doctor"),
    email: cleanEmail,
    phone: cleanPhone,
    password_hash,
    role,
    auth_providers: ["password"],
    failed_login_attempts: 0,
    locked_until: null,
  });

  // If registering as doctor or clinic admin, create initial clinic & doctor profile
  if (role === "doctor" || role === "clinic_admin") {
    const clinic = await Clinic.create({
      name: clinic_name || `${user.name}'s Clinic`,
      tagline: "Multispeciality Clinic & Healthcare",
      owner_id: user._id,
      phone: cleanPhone || "",
      email: cleanEmail || "",
      consultation_fee: Number(consultation_fee) || 500,
    });

    user.active_clinic_id = clinic._id;
    await user.save();

    await ClinicStaff.create({
      clinic_id: clinic._id,
      user_id: user._id,
      role: role === "doctor" ? "doctor" : "clinic_admin",
      permissions: ["all"],
      is_active: true,
    });

    if (role === "doctor") {
      await DoctorProfile.create({
        user_id: user._id,
        title: "Dr.",
        qualifications: ["MBBS"],
        specializations: [specialization || "General Physician"],
        medical_registration_number: registration_number || "",
      });
    }
  }

  return await issueUserTokens(user);
};

/**
 * Login user with Password + Anti-Brute-Force Lockout Defense
 */
export const loginUserService = async ({
  identifier,
  email,
  phone,
  password,
  fcm_token,
  device_info,
}) => {
  let query;
  if (identifier && identifier.trim()) {
    const cleanId = identifier.trim();
    if (cleanId.includes("@")) {
      query = { email: cleanId.toLowerCase() };
    } else {
      query = { phone: cleanId };
    }
  } else if (email && email.trim()) {
    query = { email: email.toLowerCase().trim() };
  } else if (phone && phone.trim()) {
    query = { phone: phone.trim() };
  } else {
    throw new AppError("Email or phone is required", 400);
  }

  const user = await User.findOne(query).select("+password_hash +refresh_tokens +fcm_tokens");

  if (!user) {
    throw new AppError("Invalid credentials or user not found", 401);
  }

  // 1. Check if account is currently locked
  if (user.locked_until && user.locked_until > new Date()) {
    const remainingMinutes = Math.ceil((user.locked_until.getTime() - Date.now()) / (60 * 1000));
    throw new AppError(
      `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      423
    );
  }

  if (!user.password_hash) {
    throw new AppError("Account was created via Google OAuth or OTP. Please use that login method.", 400);
  }

  // 2. Validate Password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      user.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS);
      await user.save();
      throw new AppError(
        "Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.",
        423
      );
    }

    await user.save();
    const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failed_login_attempts;
    throw new AppError(`Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`, 401);
  }

  // 3. Reset failed attempts upon successful login
  user.failed_login_attempts = 0;
  user.locked_until = null;

  // Update FCM token & device info
  if (fcm_token && !user.fcm_tokens.includes(fcm_token)) {
    user.fcm_tokens.push(fcm_token);
  }
  if (device_info) {
    user.device_info = { ...user.device_info, ...device_info };
  }

  return await issueUserTokens(user);
};

/**
 * Dedicated User Registration via OTP (Email or Mobile)
 */
export const otpRegisterService = async ({ identifier, otp, type, role = "patient", password, name, fcm_token, device_info }) => {
  const query = type === "email" ? { email: identifier.toLowerCase().trim() } : { phone: identifier.trim() };
  const existingUser = await User.findOne(query);

  if (existingUser) {
    throw new AppError(`User with this ${type} already exists. Please login instead.`, 400);
  }

  await verifyOtpService({ identifier, otp, type });

  let password_hash = undefined;
  const providerName = type === "email" ? "email_otp" : "mobile_otp";
  const authProviders = [providerName];

  if (password) {
    password_hash = await hashPassword(password);
    authProviders.push("password");
  }

  const userData = {
    name,
    role,
    auth_providers: authProviders,
    password_hash,
    fcm_tokens: fcm_token ? [fcm_token] : [],
    device_info: device_info || {},
    ...(type === "email"
      ? { email: identifier.toLowerCase().trim(), is_email_verified: true }
      : { phone: identifier.trim(), is_phone_verified: true }),
  };

  const user = await User.create(userData);

  return await issueUserTokens(user);
};

/**
 * Login / Register with Google OAuth
 */
export const googleLoginService = async ({ idToken, role = "patient", fcm_token, device_info }) => {
  const googleData = await verifyGoogleIdToken(idToken);
  const { googleId, email, name, picture } = googleData;

  let user = await User.findOne({
    $or: [{ google_id: googleId }, { email: email.toLowerCase() }],
  }).select("+refresh_tokens +fcm_tokens");

  if (user) {
    if (!user.google_id) user.google_id = googleId;
    if (!user.auth_providers.includes("google")) user.auth_providers.push("google");
    if (!user.name && name) user.name = name;
    if (!user.avatar_url && picture) user.avatar_url = picture;
    user.is_email_verified = true;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    if (fcm_token && !user.fcm_tokens.includes(fcm_token)) user.fcm_tokens.push(fcm_token);
    if (device_info) user.device_info = { ...user.device_info, ...device_info };
    await user.save();
  } else {
    user = await User.create({
      name: name || "",
      avatar_url: picture || "",
      email: email.toLowerCase(),
      google_id: googleId,
      role,
      is_email_verified: true,
      auth_providers: ["google"],
      fcm_tokens: fcm_token ? [fcm_token] : [],
      device_info: device_info || {},
    });
  }

  return await issueUserTokens(user);
};

/**
 * Login with OTP (Email or Mobile)
 */
export const otpLoginService = async ({ identifier, otp, type, role = "patient", fcm_token, device_info }) => {
  await verifyOtpService({ identifier, otp, type });

  const query = type === "email" ? { email: identifier.toLowerCase().trim() } : { phone: identifier.trim() };

  let user = await User.findOne(query).select("+refresh_tokens +fcm_tokens");

  if (user) {
    const providerName = type === "email" ? "email_otp" : "mobile_otp";
    if (!user.auth_providers.includes(providerName)) user.auth_providers.push(providerName);
    if (type === "email") user.is_email_verified = true;
    if (type === "phone") user.is_phone_verified = true;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    if (fcm_token && !user.fcm_tokens.includes(fcm_token)) user.fcm_tokens.push(fcm_token);
    if (device_info) user.device_info = { ...user.device_info, ...device_info };
    await user.save();
  } else {
    const providerName = type === "email" ? "email_otp" : "mobile_otp";
    const userData = {
      role,
      auth_providers: [providerName],
      fcm_tokens: fcm_token ? [fcm_token] : [],
      device_info: device_info || {},
      ...(type === "email" ? { email: identifier.toLowerCase().trim(), is_email_verified: true } : { phone: identifier.trim(), is_phone_verified: true }),
    };

    user = await User.create(userData);
  }

  return await issueUserTokens(user);
};

/**
 * Get user profile (/api/v1/users/me)
 */
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).populate("active_clinic_id");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return formatUserResponse(user);
};

/**
 * Update user profile & Mobile FCM Push Token (/api/v1/users/me)
 */
export const updateUserProfileService = async (userId, { name, avatar_url, fcm_token, device_info }) => {
  const user = await User.findById(userId).select("+fcm_tokens");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name !== undefined) user.name = name;
  if (avatar_url !== undefined) user.avatar_url = avatar_url;
  if (fcm_token && !user.fcm_tokens.includes(fcm_token)) {
    user.fcm_tokens.push(fcm_token);
  }
  if (device_info) {
    user.device_info = { ...user.device_info, ...device_info };
  }

  await user.save();
  return formatUserResponse(user);
};

/**
 * Refresh Access Token using Refresh Token Rotation (RTR) & Reuse Detection
 */
export const refreshTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refresh_tokens");
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  const incomingHash = hashSecret(incomingRefreshToken);

  // Check if token exists in user's active refresh tokens
  const existingTokenIndex = (user.refresh_tokens || []).findIndex(
    (rt) => rt.token_hash === incomingHash
  );

  // Token Reuse Detection: If token is valid JWT but not found in active list, possible theft!
  if (existingTokenIndex === -1) {
    // Revoke all active sessions for this user immediately
    user.refresh_tokens = [];
    await user.save();
    throw new AppError("Refresh token reuse detected. All sessions have been revoked for your security.", 401);
  }

  const existingToken = user.refresh_tokens[existingTokenIndex];
  const family = existingToken.family;

  // Generate new pair
  const newTokens = generateTokenPair({ id: user._id, role: user.role });
  const newHash = hashSecret(newTokens.refreshToken);

  // Remove old token and save new token in the same family
  user.refresh_tokens = user.refresh_tokens.filter((rt) => rt.token_hash !== incomingHash);
  user.refresh_tokens.push({
    token_hash: newHash,
    family,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  return newTokens;
};

/**
 * Logout user - Revokes specific refresh token
 */
export const logoutUserService = async (userId, refreshTokenToRevoke, fcmTokenToRevoke) => {
  const user = await User.findById(userId).select("+refresh_tokens +fcm_tokens");
  if (user) {
    if (refreshTokenToRevoke) {
      const tokenHash = hashSecret(refreshTokenToRevoke);
      user.refresh_tokens = (user.refresh_tokens || []).filter((rt) => rt.token_hash !== tokenHash);
    }
    if (fcmTokenToRevoke) {
      user.fcm_tokens = (user.fcm_tokens || []).filter((token) => token !== fcmTokenToRevoke);
    }
    await user.save();
  }
};

/**
 * Helper to issue access + refresh tokens and register in token family
 */
const issueUserTokens = async (user) => {
  const tokens = generateTokenPair({ id: user._id, role: user.role });
  const family = crypto.randomUUID();
  const tokenHash = hashSecret(tokens.refreshToken);

  if (!user.refresh_tokens) {
    user.refresh_tokens = [];
  }

  // Cap maximum concurrent sessions to 5 devices
  if (user.refresh_tokens.length >= 5) {
    user.refresh_tokens.shift();
  }

  user.refresh_tokens.push({
    token_hash: tokenHash,
    family,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokens,
    user: formatUserResponse(user),
    activeClinicId: user.active_clinic_id,
  };
};

/**
 * Helper to format clean user object response
 */
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name || "",
  avatar_url: user.avatar_url || "",
  email: user.email,
  phone: user.phone,
  role: user.role,
  active_clinic: user.active_clinic_id,
  auth_providers: user.auth_providers,
  is_email_verified: user.is_email_verified,
  is_phone_verified: user.is_phone_verified,
  device_info: user.device_info,
  createdAt: user.createdAt,
});
