import mongoose from "mongoose";
const { Schema } = mongoose;

const invoiceItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["consultation", "procedure", "vaccine", "lab_test", "pharmacy", "other"],
      default: "consultation",
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    tax_rate: {
      type: Number,
      default: 0, // GST % (0, 5, 12, 18)
    },
    total_amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      index: true,
    },
    prescription_id: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
    },
    items: {
      type: [invoiceItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_payable: {
      type: Number,
      required: true,
      min: 0,
    },
    paid_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_status: {
      type: String,
      enum: ["paid", "partial", "unpaid", "refunded"],
      default: "paid",
      index: true,
    },
    payment_method: {
      type: String,
      enum: ["cash", "upi", "card", "net_banking", "wallet"],
      default: "cash",
    },
    transaction_reference: {
      type: String,
      trim: true,
      default: "", // UPI UTR or Card Auth Code
    },
    notes: {
      type: String,
      default: "",
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound index for querying clinic daily sales
invoiceSchema.index({ clinic_id: 1, createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
