import express from "express";
import {
  searchMedicines,
  createCustomMedicine,
} from "../../controllers/medicineController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import { createMedicineSchema } from "../../validators/medicineValidator.js";

const router = express.Router();

router.use(protect);

router.get("/search", searchMedicines);
router.post(
  "/",
  authorizeRoles("doctor", "admin"),
  validate(createMedicineSchema),
  createCustomMedicine
);

export default router;
