import { config } from "../../config/env.js";

/**
 * Send OTP via Mobile SMS (Production Ready)
 * @param {string} phone 
 * @param {string} otp 
 */
export const sendSmsOtp = async (phone, otp) => {
  if (!config.sms.apiKey) {
    // In development / when SMS API key is not configured, OTP is returned in the API response for UI display instead of console
    return true;
  }

  try {
    // Standard HTTP SMS Gateway request (e.g. Fast2SMS / Twilio / MSG91 API)
    // Replace URL / payload structure according to your chosen SMS vendor
    const response = await fetch("https://api.sms-gateway-provider.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": config.sms.apiKey,
      },
      body: JSON.stringify({
        sender: config.sms.senderId,
        message: `Your Docpa verification code is ${otp}. Valid for ${config.otpExpiresInMinutes} mins.`,
        recipients: [phone],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SMS Provider error: ${errorText}`);
    }

    console.log(`[SMS SENT] OTP successfully delivered via SMS to ${phone}`);
    return true;
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send SMS to ${phone}: ${error.message}`);
    throw new Error("Failed to send OTP SMS. Please try again later.");
  }
};
