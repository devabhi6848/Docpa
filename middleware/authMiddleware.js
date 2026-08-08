import { verifyAccessToken } from "../utils/jwtUtil.js";
import { AppError } from "../utils/AppError.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("No authentication token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Access token has expired", 401));
    }
    return next(new AppError("Invalid or corrupted access token", 401));
  }
};
