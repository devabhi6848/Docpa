import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Enforce strict environment check in production mode
if (isProduction) {
  const requiredEnvVars = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`[CRITICAL] Production environment is missing required variables: ${missing.join(", ")}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/docpa",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  
  // JWT Access & Refresh Token Config
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_token_secret_change_in_production",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_token_secret_change_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  // Google Auth Config
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",

  // OTP Config
  otpExpiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 5,

  // SMTP Email Gateway Config
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || '"Docpa Health" <noreply@docpa.com>',
  },

  // SMS Gateway Config (e.g. Twilio / Fast2SMS)
  sms: {
    apiKey: process.env.SMS_API_KEY || "",
    senderId: process.env.SMS_SENDER_ID || "DOCPA",
  },
};
