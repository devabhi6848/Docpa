import express from "express";
import {
  searchPatients,
  createPatient,
  getPatientById,
  updatePatient,
  recordVitals,
  getPatientVitalsTimeline,
} from "../../controllers/patientController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { tenantGuard } from "../../middleware/tenantGuard.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import { searchLimiter } from "../../middleware/rateLimiter.js";
import {
  createPatientSchema,
  updatePatientSchema,
  recordVitalsSchema,
} from "../../validators/patientValidator.js";

const router = express.Router();

router.use(protect);
router.use(tenantGuard);

// 1. Search patients by phone / UHID / name with anti-scraping limiter
router.get("/search", searchLimiter, searchPatients);

// 2. Register new patient
router.post(
  "/",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  validate(createPatientSchema),
  createPatient
);

// 3. Get / update single patient profile
router.get("/:id", getPatientById);
router.put(
  "/:id",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  validate(updatePatientSchema),
  updatePatient
);

// 4. Record & View Patient Vitals
router.post(
  "/:id/vitals",
  authorizeRoles("doctor", "receptionist", "nurse", "clinic_admin", "admin"),
  validate(recordVitalsSchema),
  recordVitals
);
router.get("/:id/vitals", getPatientVitalsTimeline);

export default router;
