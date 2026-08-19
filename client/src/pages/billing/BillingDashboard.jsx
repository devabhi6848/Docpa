import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  QrCode,
  Printer,
  FileText,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BillingDashboard = () => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!activeClinic) return;
    setLoading(true);
    try {
      const res = await api.get('/v1/invoices/daily-collection');
      setInvoices(res.data?.invoices || []);
    } catch (err) {
      console.warn('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeClinic]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Statistics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
  const totalDue = invoices
    .filter((inv) => inv.payment_status === 'unpaid')
    .reduce((sum, inv) => sum + (Number(inv.total_payable) || 0), 0);
  const upiTotal = invoices
    .filter((inv) => inv.payment_method === 'upi')
    .reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
  const cashTotal = invoices
    .filter((inv) => inv.payment_method === 'cash')
    .reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-teal-600" />
            Billing Desk & Cashier Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily collection tracking, consultation billing, UPI receipts, and tax invoices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchInvoices}>
            Refresh
          </Button>

          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm"
          >
            Create New Invoice
          </Button>
        </div>
      </div>

      {/* Financial Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
            Today's Total Collection
          </span>
          <p className="text-3xl font-black text-emerald-900">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {invoices.length} bills generated
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block mb-1">
            UPI / Digital Payments
          </span>
          <p className="text-3xl font-black text-teal-900">{formatCurrency(upiTotal)}</p>
          <span className="text-[11px] text-teal-700 font-medium">Direct to clinic bank</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
            Cash in Desk
          </span>
          <p className="text-3xl font-black text-amber-900">{formatCurrency(cashTotal)}</p>
          <span className="text-[11px] text-amber-700 font-medium">Physical cash counter</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-rose-50 to-white border-rose-200">
          <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
            Unpaid / Pending Dues
          </span>
          <p className="text-3xl font-black text-rose-900">{formatCurrency(totalDue)}</p>
          <span className="text-[11px] text-rose-700 font-medium">Pending collection</span>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Today's Generated Bills ({invoices.length})
          </h3>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Loading clinic invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No invoices billed today</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "+ Create New Invoice" above to bill consultation or procedures.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Bill No.</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Billed Services</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <Link
                          to={`/patients/${inv.patient_id?._id}`}
                          className="hover:text-teal-600 hover:underline"
                        >
                          {inv.patient_id?.name || 'Walk-in'}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {inv.patient_id?.phone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.items?.map((it) => it.name).join(', ') || 'Consultation'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(inv.total_payable)}
                      </td>

                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {inv.payment_method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.payment_status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/billing/${inv._id}`}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onInvoiceCreated={() => {
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};
