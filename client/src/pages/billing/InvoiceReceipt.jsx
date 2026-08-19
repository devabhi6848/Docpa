import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Building2, CheckCircle2, Phone, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const InvoiceReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/v1/invoices/${id}`);
        setInvoice(res.data?.invoice);
      } catch (err) {
        showToast(err.message || 'Failed to load bill receipt', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        Loading invoice details & receipt...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-24 text-center text-slate-500">
        <h2 className="text-lg font-bold">Invoice Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate('/billing')} className="mt-4">
          Back to Billing
        </Button>
      </div>
    );
  }

  const clinic = invoice.clinic_id || {};
  const patient = invoice.patient_id || {};

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Tax Invoice #{invoice.invoice_number}
            </h1>
            <p className="text-xs text-slate-500">Billed on {formatDateTime(invoice.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" icon={Printer} onClick={() => window.print()}>
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div
        id="print-area"
        className="bg-white mx-auto w-full max-w-2xl p-8 sm:p-10 border border-slate-200 rounded-3xl shadow-sm print:p-0 print:border-none print:shadow-none min-h-[600px] flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {clinic.name || 'Docpa Multispeciality Clinic'}
                </h2>
              </div>
              <p className="text-xs text-slate-500">{clinic.tagline || 'Medical Center'}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {clinic.address?.street}, {clinic.address?.city} • +91 {clinic.phone}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                Official Bill / Receipt
              </span>
              <p className="font-mono font-extrabold text-sm text-slate-900">
                #{invoice.invoice_number}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {invoice.payment_status}
              </span>
            </div>
          </div>

          {/* Billed To Patient Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-6 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                Billed To Patient
              </span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
              <p className="text-slate-500 font-mono mt-0.5">
                {patient.phone} • UHID: {patient.uhid}
              </p>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                Payment Details
              </span>
              <span className="font-bold text-slate-800 uppercase">
                {invoice.payment_method}
              </span>
              {invoice.transaction_reference && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Ref: {invoice.transaction_reference}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 font-bold text-slate-700">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Description / Service</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="border-t-2 border-slate-900 pt-4 space-y-1.5 text-xs text-right max-w-xs ml-auto">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid:</span>
              <span className="font-mono text-teal-700">
                {formatCurrency(invoice.total_payable)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-6 mt-10 text-center text-[10px] text-slate-400">
          <p>Thank you for visiting {clinic.name}. Valid computer-generated medical receipt.</p>
        </div>
      </div>
    </div>
  );
};
