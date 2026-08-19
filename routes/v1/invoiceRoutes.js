import express from "express";
import {
  createInvoice,
  getInvoiceById,
  getClinicInvoices,
} from "../../controllers/invoiceController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { tenantGuard } from "../../middleware/tenantGuard.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import { createInvoiceSchema } from "../../validators/invoiceValidator.js";

const router = express.Router();

router.use(protect);
router.use(tenantGuard);

router.post(
  "/",
  authorizeRoles("doctor", "receptionist", "clinic_admin", "admin"),
  validate(createInvoiceSchema),
  createInvoice
);

router.get(
  "/daily-collection",
  authorizeRoles("doctor", "receptionist", "clinic_admin", "admin"),
  getClinicInvoices
);

router.get("/:id", getInvoiceById);

export default router;
