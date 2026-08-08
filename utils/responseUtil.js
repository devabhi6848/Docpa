/**
 * Utility functions for standardized API responses
 */

/**
 * Send a success API response
 * @param {object} res - Express response object
 * @param {string} message - Human-readable success message
 * @param {any} [data=null] - Payload data
 * @param {number} [statusCode=200] - HTTP status code
 * @param {object} [meta=null] - Optional metadata (e.g. pagination)
 */
export const sendSuccess = (res, message = "Success", data = null, statusCode = 200, meta = null) => {
  const responsePayload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };

  return res.status(statusCode).json(responsePayload);
};

/**
 * Send an error API response
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {any} [errors=null] - Detailed error list or validation field errors
 */
export const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };

  return res.status(statusCode).json(responsePayload);
};
