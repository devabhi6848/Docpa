import express from "express";
import { getPatientPortalData } from "../../controllers/portalController.js";

const router = express.Router();

// Public / Token-accessible patient portal
router.get("/patient/:patientId", getPatientPortalData);

export default router;
