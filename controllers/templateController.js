import {
  getDoctorTemplatesService,
  createTemplateService,
  updateTemplateService,
  deleteTemplateService,
} from "../services/templateService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const getDoctorTemplates = async (req, res, next) => {
  try {
    const templates = await getDoctorTemplatesService({ doctorId: req.user.userId });
    return sendSuccess(res, "Templates fetched successfully", { templates }, 200);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const template = await createTemplateService({
      doctorId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Rx Template created successfully", { template }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = await updateTemplateService({
      templateId: req.params.id,
      doctorId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Rx Template updated successfully", { template }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    await deleteTemplateService({
      templateId: req.params.id,
      doctorId: req.user.userId,
    });
    return sendSuccess(res, "Rx Template deleted successfully", null, 200);
  } catch (error) {
    next(error);
  }
};
