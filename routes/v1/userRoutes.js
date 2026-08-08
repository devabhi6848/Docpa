import express from "express";
import { validate } from "../../middleware/validateSchema.js";
import { protect } from "../../middleware/authMiddleware.js";
import { checkAuthMethod } from "../../middleware/checkAuthMethod.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import {
  getAvailableAuthMethods,
  registerUser,
  loginUser,
  sendOtp,
  registerWithOtp,
  loginWithOtp,
  loginWithGoogle,
  refreshToken,
  logoutUser,
} from "../../controllers/userController.js";
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  otpRegisterSchema,
  otpLoginSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from "../../validators/userValidator.js";

const router = express.Router();

// Fetch Active Auth Methods
router.get("/auth-methods", getAvailableAuthMethods);

// Password Auth
router.post(
  "/register",
  authLimiter,
  checkAuthMethod("password"),
  validate(registerSchema),
  registerUser
);
router.post(
  "/login",
  authLimiter,
  checkAuthMethod("password"),
  validate(loginSchema),
  loginUser
);

// OTP Auth (Email & Mobile)
router.post(
  "/otp/send",
  authLimiter,
  checkAuthMethod("otp"),
  validate(sendOtpSchema),
  sendOtp
);
router.post(
  "/otp/register",
  authLimiter,
  checkAuthMethod("otp"),
  validate(otpRegisterSchema),
  registerWithOtp
);
router.post(
  "/otp/verify",
  authLimiter,
  checkAuthMethod("otp"),
  validate(otpLoginSchema),
  loginWithOtp
);

// Google OAuth
router.post(
  "/google",
  authLimiter,
  checkAuthMethod("google"),
  validate(googleLoginSchema),
  loginWithGoogle
);

// Token Refresh & Logout
router.post("/refresh", validate(refreshTokenSchema), refreshToken);
router.post("/logout", protect, validate(refreshTokenSchema), logoutUser);

export default router;
