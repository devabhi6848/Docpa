import {
  createInvoiceService,
  getInvoiceByIdService,
  getClinicInvoicesService,
} from "../services/invoiceService.js";
import { logAuditEvent } from "../middleware/auditLogger.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const createInvoice = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const invoice = await createInvoiceService({
      userId,
      data: req.body,
    });

    logAuditEvent({
      req,
      action: "GENERATE_INVOICE",
      resourceType: "Invoice",
      resourceId: invoice._id,
      details: {
        invoice_number: invoice.invoice_number,
        total_payable: invoice.total_payable,
        paid_amount: invoice.paid_amount,
        payment_method: invoice.payment_method,
      },
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
      clinicId: req.query.clinic_id || req.headers["x-clinic-id"] || req.user?.active_clinic_id,
      date: req.query.date,
    });
    return sendSuccess(res, "Clinic billing collection fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};
