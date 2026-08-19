import express from "express";
import {
  getPatientVaccineSchedule,
  markVaccineGiven,
} from "../../controllers/vaccineController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/patient/:patientId", getPatientVaccineSchedule);
router.patch(
  "/:id/given",
  authorizeRoles("doctor", "nurse", "clinic_admin", "admin"),
  markVaccineGiven
);

export default router;
