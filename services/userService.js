import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwtUtil.js";
import { verifyGoogleIdToken } from "./googleAuthService.js";
import { verifyOtpService } from "./otpService.js";
import { AppError } from "../utils/AppError.js";

/**
 * Register user with Password
 */
export const registerUserService = async ({ email, phone, password, role }) => {
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
export const loginUserService = async ({ email, phone, password }) => {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select("+password_hash +refresh_tokens");

  if (!user || !user.password_hash) {
    throw new AppError("Invalid credentials or user registered via OAuth/OTP", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  return await issueUserTokens(user);
};

/**
 * Dedicated User Registration via OTP (Email or Mobile)
 */
export const otpRegisterService = async ({ identifier, otp, type, role = "patient", password }) => {
  // Check if user already exists
  const query = type === "email" ? { email: identifier } : { phone: identifier };
  const existingUser = await User.findOne(query);

  if (existingUser) {
    throw new AppError(`User with this ${type} already exists. Please login instead.`, 400);
  }

  // Verify OTP code
  await verifyOtpService({ identifier, otp, type });

  // Optional password setup during registration
  let password_hash = undefined;
  const providerName = type === "email" ? "email_otp" : "mobile_otp";
  const authProviders = [providerName];

  if (password) {
    password_hash = await hashPassword(password);
    authProviders.push("password");
  }

  // Create User
  const userData = {
    role,
    auth_providers: authProviders,
    password_hash,
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
export const googleLoginService = async ({ idToken, role = "patient" }) => {
  const googleData = await verifyGoogleIdToken(idToken);
  const { googleId, email } = googleData;

  let user = await User.findOne({
    $or: [{ google_id: googleId }, { email }],
  }).select("+refresh_tokens");

  if (user) {
    if (!user.google_id) {
      user.google_id = googleId;
    }
    if (!user.auth_providers.includes('google')) {
      user.auth_providers.push('google');
    }
    user.is_email_verified = true;
    await user.save();
  } else {
    user = await User.create({
      email,
      google_id: googleId,
      role,
      is_email_verified: true,
      auth_providers: ['google'],
    });
  }

  return await issueUserTokens(user);
};

/**
 * Login with OTP (Email or Mobile)
 */
export const otpLoginService = async ({ identifier, otp, type, role = "patient" }) => {
  // Verify OTP code
  await verifyOtpService({ identifier, otp, type });

  const query = type === "email" ? { email: identifier } : { phone: identifier };

  let user = await User.findOne(query).select("+refresh_tokens");

  if (user) {
    const providerName = type === "email" ? "email_otp" : "mobile_otp";
    if (!user.auth_providers.includes(providerName)) {
      user.auth_providers.push(providerName);
    }
    if (type === "email") user.is_email_verified = true;
    if (type === "phone") user.is_phone_verified = true;
    await user.save();
  } else {
    // Register new user via OTP if user doesn't exist
    const providerName = type === "email" ? "email_otp" : "mobile_otp";
    const userData = {
      role,
      auth_providers: [providerName],
      ...(type === "email" ? { email: identifier, is_email_verified: true } : { phone: identifier, is_phone_verified: true }),
    };

    user = await User.create(userData);
  }

  return await issueUserTokens(user);
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
export const logoutUserService = async (userId, refreshTokenToRevoke) => {
  const user = await User.findById(userId).select("+refresh_tokens");
  if (user) {
    user.refresh_tokens = user.refresh_tokens.filter((token) => token !== refreshTokenToRevoke);
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
 * Helper to format clean user object response
 */
const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  phone: user.phone,
  role: user.role,
  auth_providers: user.auth_providers,
  is_email_verified: user.is_email_verified,
  is_phone_verified: user.is_phone_verified,
  createdAt: user.createdAt,
});
