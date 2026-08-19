import express from "express";
import userRoutes from "./v1/userRoutes.js";
import clinicRoutes from "./v1/clinicRoutes.js";
import doctorRoutes from "./v1/doctorRoutes.js";
import patientRoutes from "./v1/patientRoutes.js";
import queueRoutes from "./v1/queueRoutes.js";
import medicineRoutes from "./v1/medicineRoutes.js";
import templateRoutes from "./v1/templateRoutes.js";
import prescriptionRoutes from "./v1/prescriptionRoutes.js";
import vaccineRoutes from "./v1/vaccineRoutes.js";
import growthRoutes from "./v1/growthRoutes.js";
import invoiceRoutes from "./v1/invoiceRoutes.js";
import teleconsultationRoutes from "./v1/teleconsultationRoutes.js";
import portalRoutes from "./v1/portalRoutes.js";
import analyticsRoutes from "./v1/analyticsRoutes.js";

const router = express.Router();

router.use("/v1/users", userRoutes);
router.use("/v1/clinics", clinicRoutes);
router.use("/v1/doctors", doctorRoutes);
router.use("/v1/patients", patientRoutes);
router.use("/v1/queue", queueRoutes);
router.use("/v1/medicines", medicineRoutes);
router.use("/v1/templates", templateRoutes);
router.use("/v1/prescriptions", prescriptionRoutes);
router.use("/v1/vaccines", vaccineRoutes);
router.use("/v1/growth", growthRoutes);
router.use("/v1/invoices", invoiceRoutes);
router.use("/v1/teleconsultations", teleconsultationRoutes);
router.use("/v1/portal", portalRoutes);
router.use("/v1/analytics", analyticsRoutes);

export default router;
