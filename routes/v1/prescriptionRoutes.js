import express from "express";
import {
  issuePrescription,
  getPrescriptionById,
  getPatientPrescriptions,
} from "../../controllers/prescriptionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import { createPrescriptionSchema } from "../../validators/prescriptionValidator.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("doctor", "admin"),
  validate(createPrescriptionSchema),
  issuePrescription
);
router.get("/:id", getPrescriptionById);
router.get("/patient/:patientId", getPatientPrescriptions);

export default router;
