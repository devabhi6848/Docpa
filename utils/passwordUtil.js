import bcrypt from "bcrypt";
import { config } from "../config/env.js";

/**
 * Hash a plain text password using bcrypt
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
