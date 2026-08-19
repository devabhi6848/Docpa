import express from "express";
import {
  recordGrowthMetric,
  getPatientGrowthHistory,
} from "../../controllers/growthController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/patient/:patientId",
  authorizeRoles("doctor", "nurse", "clinic_admin", "admin"),
  recordGrowthMetric
);
router.get("/patient/:patientId", getPatientGrowthHistory);

export default router;
