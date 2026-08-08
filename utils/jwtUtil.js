import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Generate JWT token for a payload
 * @param {object} payload 
 * @returns {string}
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
