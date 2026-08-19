import express from "express";
import {
  createClinic,
  getMyClinics,
  getClinicById,
  updateClinic,
  addStaff,
  getClinicStaff,
  updateStaff,
  removeStaff,
  switchActiveClinic,
} from "../../controllers/clinicController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles, requireClinicAccess } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import {
  createClinicSchema,
  updateClinicSchema,
  addStaffSchema,
  updateStaffSchema,
} from "../../validators/clinicValidator.js";

const router = express.Router();

// All clinic routes require authenticated session
router.use(protect);

// 1. Get user's clinics & switch active clinic
router.get("/my-clinics", getMyClinics);
router.post("/switch-active", switchActiveClinic);

// 2. Create clinic (Doctors and Clinic Admins)
router.post(
  "/",
  authorizeRoles("doctor", "clinic_admin", "admin"),
  validate(createClinicSchema),
  createClinic
);

// 3. Get single clinic details (Staff & Doctor access)
router.get("/:id", requireClinicAccess(), getClinicById);

// 4. Update clinic settings & letterhead (Owner & Clinic Admin)
router.put(
  "/:id",
  requireClinicAccess(["owner", "clinic_admin"]),
  validate(updateClinicSchema),
  updateClinic
);

// 5. Staff Management
router.get("/:id/staff", requireClinicAccess(["owner", "clinic_admin", "doctor"]), getClinicStaff);
router.post(
  "/:id/staff",
  requireClinicAccess(["owner", "clinic_admin"]),
  validate(addStaffSchema),
  addStaff
);
router.put(
  "/:id/staff/:staffId",
  requireClinicAccess(["owner", "clinic_admin"]),
  validate(updateStaffSchema),
  updateStaff
);
router.delete(
  "/:id/staff/:staffId",
  requireClinicAccess(["owner", "clinic_admin"]),
  removeStaff
);

export default router;
