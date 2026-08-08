import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwtUtil.js";
import { verifyGoogleIdToken } from "./googleAuthService.js";
import { verifyOtpService } from "./otpService.js";
import { AppError } from "../utils/AppError.js";

/**
 * Register user with Password
 */
export const registerUserService = async ({ email, phone, password, role, name }) => {
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }
  }

  if (phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError("User with this phone number already exists", 400);
    }
  }

  const password_hash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    phone,
    password_hash,
    role,
    auth_providers: ['password'],
  });

  return formatUserResponse(user);
};

/**
 * Login user with Password
 */
export const loginUserService = async ({ email, phone, password, fcm_token, device_info }) => {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select("+password_hash +refresh_tokens +fcm_tokens");

  if (!user || !user.password_hash) {
    throw new AppError("Invalid credentials or user registered via OAuth/OTP", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // Update FCM token & device info if provided by mobile app
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
  const query = type === "email" ? { email: identifier } : { phone: identifier };
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
      ? { email: identifier, is_email_verified: true }
      : { phone: identifier, is_phone_verified: true }),
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
    $or: [{ google_id: googleId }, { email }],
  }).select("+refresh_tokens +fcm_tokens");

  if (user) {
    if (!user.google_id) user.google_id = googleId;
    if (!user.auth_providers.includes('google')) user.auth_providers.push('google');
    if (!user.name && name) user.name = name;
    if (!user.avatar_url && picture) user.avatar_url = picture;
    user.is_email_verified = true;
    if (fcm_token && !user.fcm_tokens.includes(fcm_token)) user.fcm_tokens.push(fcm_token);
    if (device_info) user.device_info = { ...user.device_info, ...device_info };
    await user.save();
  } else {
    user = await User.create({
      name: name || '',
      avatar_url: picture || '',
      email,
      google_id: googleId,
      role,
      is_email_verified: true,
      auth_providers: ['google'],
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

  const query = type === "email" ? { email: identifier } : { phone: identifier };

  let user = await User.findOne(query).select("+refresh_tokens +fcm_tokens");

  if (user) {
    const providerName = type === "email" ? "email_otp" : "mobile_otp";
    if (!user.auth_providers.includes(providerName)) user.auth_providers.push(providerName);
    if (type === "email") user.is_email_verified = true;
    if (type === "phone") user.is_phone_verified = true;
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
      ...(type === "email" ? { email: identifier, is_email_verified: true } : { phone: identifier, is_phone_verified: true }),
    };

    user = await User.create(userData);
  }

  return await issueUserTokens(user);
};

/**
 * Get user profile (/api/v1/users/me)
 */
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId);
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
 * Refresh Access Token using Refresh Token
 */
export const refreshTokenService = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refresh_tokens");
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  if (!user.refresh_tokens.includes(incomingRefreshToken)) {
    throw new AppError("Refresh token is invalid or has been revoked", 401);
  }

  const newTokens = generateTokenPair({ id: user._id, role: user.role });

  user.refresh_tokens = user.refresh_tokens.filter((token) => token !== incomingRefreshToken);
  user.refresh_tokens.push(newTokens.refreshToken);
  await user.save();

  return newTokens;
};

/**
 * Logout user
 */
export const logoutUserService = async (userId, refreshTokenToRevoke, fcmTokenToRevoke) => {
  const user = await User.findById(userId).select("+refresh_tokens +fcm_tokens");
  if (user) {
    if (refreshTokenToRevoke) {
      user.refresh_tokens = user.refresh_tokens.filter((token) => token !== refreshTokenToRevoke);
    }
    if (fcmTokenToRevoke) {
      user.fcm_tokens = user.fcm_tokens.filter((token) => token !== fcmTokenToRevoke);
    }
    await user.save();
  }
};

/**
 * Helper to issue access + refresh tokens and update DB
 */
const issueUserTokens = async (user) => {
  const tokens = generateTokenPair({ id: user._id, role: user.role });

  if (!user.refresh_tokens) {
    user.refresh_tokens = [];
  }
  user.refresh_tokens.push(tokens.refreshToken);
  await user.save();

  return {
    tokens,
    user: formatUserResponse(user),
  };
};

/**
 * Helper to format clean user object response for mobile & web
 */
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name || "",
  avatar_url: user.avatar_url || "",
  email: user.email,
  phone: user.phone,
  role: user.role,
  auth_providers: user.auth_providers,
  is_email_verified: user.is_email_verified,
  is_phone_verified: user.is_phone_verified,
  device_info: user.device_info,
  createdAt: user.createdAt,
});
