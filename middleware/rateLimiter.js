import rateLimit from "express-rate-limit";
import { sendError } from "../utils/responseUtil.js";

/**
 * Strict Rate Limiter for Authentication & Sensitive Endpoints
 * (Blocks brute-force credential stuffing & dictionary attacks)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "Too many authentication attempts from this IP. Please try again after 15 minutes.",
      429
    );
  },
});

/**
 * Specialized Rate Limiter for OTP Requests (SMS & Email Flooding Defense)
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 OTP requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "Too many OTP requests. Please wait a few minutes before trying again.",
      429
    );
  },
});

/**
 * Anti-Scraping Rate Limiter for Catalog & Patient Searches
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit to 30 queries per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "Search query rate limit exceeded. Please slow down your requests.",
      429
    );
  },
});

/**
 * General API Gateway Rate Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "API rate limit exceeded. Please reduce request frequency.",
      429
    );
  },
});
