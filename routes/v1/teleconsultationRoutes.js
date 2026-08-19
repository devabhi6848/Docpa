import express from "express";
import {
  createTeleconsultation,
  getTeleconsultationByMeetingId,
  updateTeleconsultationStatus,
} from "../../controllers/teleconsultationController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Public meeting join details (for patient opening link from WhatsApp)
router.get("/room/:meetingId", getTeleconsultationByMeetingId);

// Protected routes
router.use(protect);

router.post(
  "/",
  authorizeRoles("doctor", "receptionist", "admin"),
  createTeleconsultation
);

router.patch("/room/:meetingId/status", updateTeleconsultationStatus);

export default router;
