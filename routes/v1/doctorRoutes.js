import express from "express";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../../controllers/doctorController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import { doctorProfileSchema } from "../../validators/doctorValidator.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("doctor", "admin"));

router.get("/profile", getDoctorProfile);
router.put("/profile", validate(doctorProfileSchema), updateDoctorProfile);

export default router;
