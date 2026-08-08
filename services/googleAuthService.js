import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const client = new OAuth2Client(config.googleClientId);

/**
 * Verify Google ID Token
 * @param {string} idToken 
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  try {
    if (!config.googleClientId) {
      // Development fallback if GOOGLE_CLIENT_ID isn't set yet in .env
      console.warn("[DEV MODE] GOOGLE_CLIENT_ID is not configured in .env. Decoding payload directly.");
      const base64Url = idToken.split('.')[1];
      if (!base64Url) throw new Error("Invalid Google token format");
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      
      return {
        googleId: payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    throw new AppError(`Google authentication failed: ${error.message}`, 401);
  }
};
