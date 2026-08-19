import express from "express";
import { getClinicAnalyticsSummary } from "../../controllers/analyticsController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("doctor", "clinic_admin", "admin"));

router.get("/summary", getClinicAnalyticsSummary);

export default router;
