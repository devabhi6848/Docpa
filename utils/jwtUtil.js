import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Generate Access Token (short-lived)
 * @param {object} payload 
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
};

/**
 * Generate Refresh Token (long-lived)
 * @param {object} payload 
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

/**
 * Generate both Access Token and Refresh Token pair
 * @param {object} payload 
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 * @param {string} token 
 * @returns {object} decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtAccessSecret);
};

/**
 * Verify Refresh Token
 * @param {string} token 
 * @returns {object} decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};
