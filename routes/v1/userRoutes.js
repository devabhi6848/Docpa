import express from "express";
import { validate } from "../../middleware/validateSchema.js";
import { registerUser, loginUser } from "../../controllers/userController.js";
import { registerSchema, loginSchema } from "../../validators/userValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
