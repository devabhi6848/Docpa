import {
  createInvoiceService,
  getInvoiceByIdService,
  getClinicInvoicesService,
} from "../services/invoiceService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await createInvoiceService({
      userId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Invoice generated successfully", { invoice }, 201);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await getInvoiceByIdService({
      invoiceId: req.params.id,
    });
    return sendSuccess(res, "Invoice fetched successfully", { invoice }, 200);
  } catch (error) {
    next(error);
  }
};

export const getClinicInvoices = async (req, res, next) => {
  try {
    const data = await getClinicInvoicesService({
      clinicId: req.query.clinic_id || req.headers["x-clinic-id"],
      date: req.query.date,
    });
    return sendSuccess(res, "Clinic billing collection fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};
