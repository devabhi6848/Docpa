import express from "express";
import { validate } from "../../middleware/validateSchema.js";
import { protect } from "../../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../../controllers/userController.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../validators/userValidator.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post("/logout", protect, validate(refreshTokenSchema), logoutUser);

export default router;
