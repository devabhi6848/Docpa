import {
  registerUserService,
  loginUserService,
  otpRegisterService,
  googleLoginService,
  otpLoginService,
  refreshTokenService,
  logoutUserService,
} from "../services/userService.js";
import { sendOtpService } from "../services/otpService.js";
import { sendSuccess } from "../utils/responseUtil.js";
import { authConfig } from "../config/authConfig.js";

/**
 * Get current allowed authentication methods configuration
 */
export const getAvailableAuthMethods = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      "Available authentication methods fetched successfully",
      { methods: authConfig.methods },
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Register user with password
 */
export const registerUser = async (req, res, next) => {
  try {
    const userData = await registerUserService(req.body);
    return sendSuccess(res, "User registered successfully", { user: userData }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user with password
 */
export const loginUser = async (req, res, next) => {
  try {
    const authData = await loginUserService(req.body);
    return sendSuccess(res, "Login successful", authData, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Request OTP via Email or Mobile SMS
 */
export const sendOtp = async (req, res, next) => {
  try {
    const result = await sendOtpService(req.body);
    return sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Explicit Registration using OTP (Email or Mobile)
 */
export const registerWithOtp = async (req, res, next) => {
  try {
    const authData = await otpRegisterService(req.body);
    return sendSuccess(res, "User registered successfully with OTP", authData, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login / Verify using OTP (Email or Mobile)
 */
export const loginWithOtp = async (req, res, next) => {
  try {
    const authData = await otpLoginService(req.body);
    return sendSuccess(res, "OTP verification successful", authData, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Login / Register using Google OAuth ID Token
 */
export const loginWithGoogle = async (req, res, next) => {
  try {
    const authData = await googleLoginService(req.body);
    return sendSuccess(res, "Google login successful", authData, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access & Refresh Tokens
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const tokens = await refreshTokenService(token);
    return sendSuccess(res, "Token refreshed successfully", { tokens }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout & Revoke Refresh Token
 */
export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    await logoutUserService(req.user.id, token);
    return sendSuccess(res, "Logged out successfully", null, 200);
  } catch (error) {
    next(error);
  }
};
