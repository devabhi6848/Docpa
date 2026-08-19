import express from "express";
import {
  getDoctorTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../controllers/templateController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { validate } from "../../middleware/validateSchema.js";
import {
  createRxTemplateSchema,
  updateRxTemplateSchema,
} from "../../validators/templateValidator.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("doctor", "admin"));

router.get("/", getDoctorTemplates);
router.post("/", validate(createRxTemplateSchema), createTemplate);
router.put("/:id", validate(updateRxTemplateSchema), updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;
