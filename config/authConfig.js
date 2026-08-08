import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized Authentication Feature Toggle Configuration
 * Enables or disables login/registration methods globally or by role.
 */
export const authConfig = {
  // Global feature toggles for authentication methods
  methods: {
    password: process.env.ENABLE_PASSWORD_AUTH !== "false",   // Default: true
    google: process.env.ENABLE_GOOGLE_AUTH !== "false",       // Default: true
    emailOtp: process.env.ENABLE_EMAIL_OTP_AUTH !== "false",  // Default: true
    mobileOtp: process.env.ENABLE_MOBILE_OTP_AUTH !== "false",// Default: true
  },

  // Helper method to check if a login method is enabled
  isMethodEnabled(method) {
    return !!this.methods[method];
  },
};
