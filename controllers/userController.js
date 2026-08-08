import {
  registerUserService,
  loginUserService,
  refreshTokenService,
  logoutUserService,
} from "../services/userService.js";
import { sendSuccess } from "../utils/responseUtil.js";

/**
 * Register user
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
 * Login user
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
