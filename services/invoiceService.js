import Invoice from "../models/InvoiceModel.js";
import Clinic from "../models/ClinicModel.js";
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";
import { generateInvoiceWhatsAppLink } from "./whatsappService.js";
import { AppError } from "../utils/AppError.js";

const generateInvoiceNumber = async () => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${dateStr}-${random}`;
};

/**
 * Generate a new clinic invoice receipt
 */
export const createInvoiceService = async ({ userId, data }) => {
  const clinic = await Clinic.findById(data.clinic_id);
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const patient = await Patient.findById(data.patient_id);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await Invoice.create({
    ...data,
    invoice_number: invoiceNumber,
    created_by: userId,
  });

  const populated = await Invoice.findById(invoice._id)
    .populate("clinic_id")
    .populate("doctor_id", "name email phone")
    .populate("patient_id");

  const whatsappLink = generateInvoiceWhatsAppLink({
    phone: patient.phone,
    patientName: patient.name,
    clinicName: clinic.name,
    invoiceNumber: populated.invoice_number,
    totalPayable: populated.total_payable,
    paidAmount: populated.paid_amount,
    paymentMethod: populated.payment_method,
    invoiceUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/billing/view/${populated._id}`,
  });

  return {
    ...populated.toObject(),
    whatsapp_link: whatsappLink,
  };
};

/**
 * Get single invoice with clinic letterhead details
 */
export const getInvoiceByIdService = async ({ invoiceId }) => {
  const invoice = await Invoice.findById(invoiceId)
    .populate("clinic_id")
    .populate("doctor_id", "name email phone")
    .populate("patient_id");

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  const whatsappLink = generateInvoiceWhatsAppLink({
    phone: invoice.patient_id?.phone,
    patientName: invoice.patient_id?.name,
    clinicName: invoice.clinic_id?.name,
    invoiceNumber: invoice.invoice_number,
    totalPayable: invoice.total_payable,
    paidAmount: invoice.paid_amount,
    paymentMethod: invoice.payment_method,
    invoiceUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/billing/view/${invoice._id}`,
  });

  return {
    ...invoice.toObject(),
    whatsapp_link: whatsappLink,
  };
};

/**
 * Get daily collection summary for clinic POS
 */
export const getClinicInvoicesService = async ({ clinicId, date }) => {
  const queryDate = date || new Date().toISOString().slice(0, 10);
  const startOfDay = new Date(`${queryDate}T00:00:00.000Z`);
  const endOfDay = new Date(`${queryDate}T23:59:59.999Z`);

  const invoices = await Invoice.find({
    clinic_id: clinicId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("patient_id", "name phone uhid")
    .populate("doctor_id", "name")
    .sort({ createdAt: -1 });

  let totalRevenue = 0;
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;

  invoices.forEach((inv) => {
    totalRevenue += inv.paid_amount || 0;
    if (inv.payment_method === "cash") cashTotal += inv.paid_amount || 0;
    if (inv.payment_method === "upi") upiTotal += inv.paid_amount || 0;
    if (inv.payment_method === "card") cardTotal += inv.paid_amount || 0;
  });

  return {
    date: queryDate,
    stats: {
      total_invoices: invoices.length,
      total_revenue: totalRevenue,
      cash_total: cashTotal,
      upi_total: upiTotal,
      card_total: cardTotal,
    },
    invoices,
  };
};
