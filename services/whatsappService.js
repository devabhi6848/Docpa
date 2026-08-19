/**
 * Formats WhatsApp direct click-to-chat links with pre-composed professional clinical messages
 */

export const generateRxWhatsAppLink = ({
  phone,
  patientName,
  doctorName,
  clinicName,
  rxNumber,
  followUpDate,
  prescriptionUrl,
}) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
  if (!cleanPhone || cleanPhone.length !== 10) return null;

  const msg =
    `*Hello ${patientName || "Patient"},*\n\n` +
    `Thank you for visiting *${clinicName || "our clinic"}* today.\n\n` +
    `👨‍⚕️ *Consultant:* Dr. ${doctorName || "Doctor"}\n` +
    `📄 *Rx No:* ${rxNumber || "RX"}\n` +
    (followUpDate ? `🗓️ *Follow-up Date:* ${new Date(followUpDate).toLocaleDateString()}\n` : "") +
    (prescriptionUrl ? `\n🔗 *View Digital Prescription:* ${prescriptionUrl}\n` : "") +
    `\n_Please take your medications on time. Wishing you a speedy recovery!_ 🩺✨`;

  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
};

export const generateInvoiceWhatsAppLink = ({
  phone,
  patientName,
  clinicName,
  invoiceNumber,
  totalPayable,
  paidAmount,
  paymentMethod,
  invoiceUrl,
}) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
  if (!cleanPhone || cleanPhone.length !== 10) return null;

  const msg =
    `*Hello ${patientName || "Patient"},*\n\n` +
    `Here is your official payment receipt from *${clinicName || "our clinic"}*.\n\n` +
    `🧾 *Invoice No:* ${invoiceNumber}\n` +
    `💰 *Total Amount:* ₹${totalPayable}\n` +
    `✅ *Paid Amount:* ₹${paidAmount} (${(paymentMethod || "cash").toUpperCase()})\n` +
    (invoiceUrl ? `\n🔗 *Download Receipt:* ${invoiceUrl}\n` : "") +
    `\nThank you for choosing us for your healthcare! 🙏`;

  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
};
