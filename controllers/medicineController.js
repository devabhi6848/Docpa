import {
  searchMedicinesService,
  createCustomMedicineService,
} from "../services/medicineService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const searchMedicines = async (req, res, next) => {
  try {
    const medicines = await searchMedicinesService({
      query: req.query.q || "",
      doctorId: req.user.userId,
    });
    return sendSuccess(res, "Medicines fetched successfully", { medicines }, 200);
  } catch (error) {
    next(error);
  }
};

export const createCustomMedicine = async (req, res, next) => {
  try {
    const medicine = await createCustomMedicineService({
      doctorId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Custom medicine created successfully", { medicine }, 201);
  } catch (error) {
    next(error);
  }
};
