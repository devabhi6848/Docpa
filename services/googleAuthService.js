import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const client = new OAuth2Client();

/**
 * Verify Google ID Token from Mobile (Android / iOS) or Web
 * @param {string} idToken 
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  try {
    if (config.googleClientIds.length === 0) {
      // Development fallback if GOOGLE_CLIENT_ID isn't set yet in .env
      console.warn("[DEV MODE] No GOOGLE_CLIENT_ID configured in .env. Decoding token payload directly.");
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
      audience: config.googleClientIds, // Verifies against Android, iOS, and Web Google Client IDs
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
