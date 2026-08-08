import { authConfig } from "../config/authConfig.js";
import { AppError } from "../utils/AppError.js";

/**
 * Middleware to check if a specific authentication method is enabled
 * @param {('password'|'google'|'emailOtp'|'mobileOtp')} method 
 */
export const checkAuthMethod = (method) => (req, res, next) => {
  // If request contains type='email' or type='phone' for OTP endpoints
  if (method === "otp") {
    const otpType = req.body.type;
    const targetMethod = otpType === "email" ? "emailOtp" : "mobileOtp";
    if (!authConfig.isMethodEnabled(targetMethod)) {
      return next(
        new AppError(
          `Authentication method '${targetMethod}' is currently disabled on this server.`,
          403
        )
      );
    }
    return next();
  }

  if (!authConfig.isMethodEnabled(method)) {
    return next(
      new AppError(
        `Authentication method '${method}' is currently disabled on this server.`,
        403
      )
    );
  }

  next();
};
