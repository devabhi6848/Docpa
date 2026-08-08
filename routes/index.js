import express from "express";
import userRoutes from "./v1/userRoutes.js";

const router = express.Router();

router.use("/v1/users", userRoutes);

export default router;
