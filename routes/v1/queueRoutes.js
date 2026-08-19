import express from "express";
import {
  generateToken,
  getTodayQueue,
  updateTokenStatus,
  getTvDisplayQueue,
} from "../../controllers/queueController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { tenantGuard } from "../../middleware/tenantGuard.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import {
  generateTokenSchema,
  updateTokenStatusSchema,
} from "../../validators/queueValidator.js";

const router = express.Router();

// Public TV Display endpoint (No auth required for waiting room screens)
router.get("/tv-display/:clinicId", getTvDisplayQueue);

// Protected routes
router.use(protect);
router.use(tenantGuard);

// 1. Generate OPD Token
router.post(
  "/token",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  validate(generateTokenSchema),
  generateToken
);

// 2. Get Today's Live Queue
router.get(
  "/today",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  getTodayQueue
);

// 3. Update Token Status (Call patient, complete, cancel)
router.patch(
  "/:id/status",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  validate(updateTokenStatusSchema),
  updateTokenStatus
);

export default router;
