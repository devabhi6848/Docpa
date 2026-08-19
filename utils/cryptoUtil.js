import crypto from "crypto";
import { config } from "../config/env.js";

// Master encryption key derived from JWT secret or custom key, hashed to 32 bytes (256 bits)
const getMasterKey = () => {
  const secret = config.jwtAccessSecret || "fallback-secret-docpa-super-secure-key-32-chars";
  return crypto.createHash("sha256").update(secret).digest();
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM recommended by NIST
const AUTH_TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Encrypt sensitive PHI/PII string using AES-256-GCM authenticated encryption
 * @param {string} text Plaintext to encrypt
 * @returns {string} Colon-separated string: iv:authTag:ciphertext (hex encoded)
 */
export const encryptField = (text) => {
  if (text === null || text === undefined || text === "") return text;
  
  const strText = String(text);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);

  let encrypted = cipher.update(strText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypt AES-256-GCM ciphertext
 * @param {string} cipherText Formatted as iv:authTag:ciphertext
 * @returns {string} Decrypted plaintext
 */
export const decryptField = (cipherText) => {
  if (!cipherText || typeof cipherText !== "string" || !cipherText.includes(":")) {
    return cipherText;
  }

  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      return cipherText;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // If decryption fails (e.g. legacy unencrypted record), return original string safely
    return cipherText;
  }
};

/**
 * Constant-time secure string comparison to prevent timing attacks
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
export const safeCompare = (a, b) => {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Hash a high-entropy token or secret (e.g. Refresh Token, API key) using SHA-256
 * @param {string} value 
 * @returns {string} Hex-encoded hash
 */
export const hashSecret = (value) => {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
};
