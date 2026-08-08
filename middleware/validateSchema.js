import { ZodError } from "zod";
import { sendError } from "../utils/responseUtil.js";

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return sendError(res, "Validation failed", 400, formattedErrors);
    }

    return sendError(res, "Validation middleware error", 500);
  }
};
