import Otp from "../models/OtpModel.js";
import { generateNumericOtp, hashOtp } from "../utils/otpUtil.js";
import { safeCompare } from "../utils/cryptoUtil.js";
import { sendEmailOtp } from "./notification/emailNotificationService.js";
import { sendSmsOtp } from "./notification/smsNotificationService.js";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";

const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 3;

/**
 * Generate and send OTP via Email or SMS with cooldown protection
 */
export const sendOtpService = async ({ identifier, type }) => {
  // 1. Check for active cooldown
  const existingOtp = await Otp.findOne({ identifier, type });
  if (existingOtp) {
    const elapsedSeconds = (Date.now() - new Date(existingOtp.last_requested_at).getTime()) / 1000;
    if (elapsedSeconds < OTP_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(OTP_COOLDOWN_SECONDS - elapsedSeconds);
      throw new AppError(`Please wait ${waitTime} seconds before requesting a new OTP.`, 429);
    }
  }

  // 2. Generate 6-digit cryptographic OTP
  const rawOtp = generateNumericOtp();
  const hashedOtp = hashOtp(rawOtp);

  // 3. Clear older records for this identifier and type
  await Otp.deleteMany({ identifier, type });

  // 4. Save new OTP to database
  await Otp.create({
    identifier,
    otp: hashedOtp,
    type,
    attempts_count: 0,
    last_requested_at: new Date(),
  });

  // 5. Dispatch OTP notification
  if (type === "email") {
    await sendEmailOtp(identifier, rawOtp);
  } else if (type === "phone") {
    await sendSmsOtp(identifier, rawOtp);
  } else {
    throw new AppError("Invalid OTP channel type", 400);
  }

  // In development mode, return OTP for easy testing
  const devData = !config.isProduction ? { otp: rawOtp } : null;

  return {
    message: `OTP sent successfully to ${type}`,
    data: devData,
  };
};

/**
 * Verify OTP with max attempts lockout and constant-time comparison
 */
export const verifyOtpService = async ({ identifier, otp, type }) => {
  const hashedOtp = hashOtp(otp);

  const otpRecord = await Otp.findOne({
    identifier,
    type,
  });

  if (!otpRecord) {
    throw new AppError("OTP has expired or was not requested. Please request a new one.", 400);
  }

  // Check max attempts
  if (otpRecord.attempts_count >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError("Maximum OTP attempts exceeded. This OTP has been invalidated.", 429);
  }

  // Constant-time comparison
  const isValid = safeCompare(otpRecord.otp, hashedOtp);

  if (!isValid) {
    otpRecord.attempts_count += 1;
    await otpRecord.save();
    const remainingAttempts = MAX_OTP_ATTEMPTS - otpRecord.attempts_count;
    if (remainingAttempts <= 0) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new AppError("Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.", 429);
    }
    throw new AppError(`Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`, 400);
  }

  // Delete OTP after successful verification (one-time use)
  await Otp.deleteOne({ _id: otpRecord._id });

  return true;
};
