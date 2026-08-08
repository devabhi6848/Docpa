import crypto from "crypto";

/**
 * Generate a random 6-digit numeric OTP
 * @returns {string}
 */
export const generateNumericOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP using SHA-256 for secure DB comparison
 * @param {string} otp 
 * @returns {string}
 */
export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};
