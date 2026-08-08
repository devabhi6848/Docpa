import { sendError } from "../utils/responseUtil.js";
import { config } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle Mongoose Duplicate Key Errors (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `A record with this ${field} already exists.`;
    return sendError(res, message, 400);
  }

  // Handle Mongoose CastError (Invalid MongoDB ObjectIDs)
  if (err.name === "CastError") {
    const message = `Invalid resource ID format: ${err.value}`;
    return sendError(res, message, 400);
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, "Validation Error", 400, errors);
  }

  // Handle JWT Signature Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token. Authentication failed.", 401);
  }

  // Handle JWT Token Expired
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token has expired. Please log in again.", 401);
  }

  // Development Error Response (Includes Stack Trace)
  if (!config.isProduction) {
    return sendError(res, err.message, err.statusCode, {
      stack: err.stack,
      error: err,
    });
  }

  // Production Operational Error Response
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // Production Programming or Unknown Server Errors (Hide details from client)
  console.error("[CRITICAL ERROR 💥]", err);
  return sendError(res, "An unexpected server error occurred. Please try again later.", 500);
};
