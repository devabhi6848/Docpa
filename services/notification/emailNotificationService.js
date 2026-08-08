import nodemailer from "nodemailer";
import { config } from "../../config/env.js";

let transporter = null;

if (config.smtp.host && config.smtp.user) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    family: 4, // Force IPv4 to prevent IPv6 DNS resolution timeouts on cloud platforms (Render/AWS/etc.)
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 5000,   // 5s greeting timeout
    socketTimeout: 15000,    // 15s socket timeout
  });
}

/**
 * Send OTP via Email (Production Ready)
 * @param {string} email 
 * @param {string} otp 
 */
export const sendEmailOtp = async (email, otp) => {
  if (!transporter) {
    console.log(`[DEV MODE / NO SMTP] 📧 OTP for ${email}: [ ${otp} ]`);
    return true;
  }

  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: "Your Authentication OTP - Docpa Health",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Docpa Verification Code</h2>
        <p>Your one-time passcode (OTP) for authentication is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #1a73e8;">${otp}</h1>
        <p>This OTP is valid for <strong>${config.otpExpiresInMinutes} minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <p style="font-size: 12px; color: #777;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] OTP successfully delivered to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${email}: ${error.message}`);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};
