import Otp from "../models/OtpModel.js";
import { generateNumericOtp, hashOtp } from "../utils/otpUtil.js";
import { sendEmailOtp } from "./notification/emailNotificationService.js";
import { sendSmsOtp } from "./notification/smsNotificationService.js";
import { AppError } from "../utils/AppError.js";

/**
 * Generate and send OTP via Email or SMS
 */
export const sendOtpService = async ({ identifier, type }) => {
  // Generate 6-digit OTP
  const rawOtp = generateNumericOtp();
  const hashedOtp = hashOtp(rawOtp);

  // Clear existing OTPs for this identifier and type
  await Otp.deleteMany({ identifier, type });

  // Save new OTP to database
  await Otp.create({
    identifier,
    otp: hashedOtp,
    type,
  });

  // Dispatch OTP notification
  if (type === "email") {
    await sendEmailOtp(identifier, rawOtp);
  } else if (type === "phone") {
    await sendSmsOtp(identifier, rawOtp);
  } else {
    throw new AppError("Invalid OTP channel type", 400);
  }

  return { message: `OTP sent successfully to ${type}` };
};

/**
 * Verify OTP
 */
export const verifyOtpService = async ({ identifier, otp, type }) => {
  const hashedOtp = hashOtp(otp);

  const otpRecord = await Otp.findOne({
    identifier,
    type,
  });

  if (!otpRecord) {
    throw new AppError("OTP has expired or was not requested", 400);
  }

  if (otpRecord.otp !== hashedOtp) {
    throw new AppError("Invalid OTP code", 400);
  }

  // Delete OTP after successful verification (one-time use)
  await Otp.deleteOne({ _id: otpRecord._id });

  return true;
};
