import { sendError } from "../utils/responseUtil.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return sendError(res, err.message, err.statusCode, {
      stack: err.stack,
      error: err,
    });
  }

  // Production operational error response
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // Unknown or programming error
  console.error("ERROR 💥", err);
  return sendError(res, "Something went wrong on the server!", 500);
};
