import rateLimit from "express-rate-limit";
import { sendError } from "../utils/responseUtil.js";

/**
 * Strict Rate Limiter for Authentication & Sensitive Endpoints
 * (Prevents brute force login & OTP SMS spamming)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    return sendError(
      res,
      "Too many authentication attempts from this IP. Please try again after 15 minutes.",
      429
    );
  },
});

/**
 * General API Rate Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "Too many requests from this IP. Please slow down.",
      429
    );
  },
});
