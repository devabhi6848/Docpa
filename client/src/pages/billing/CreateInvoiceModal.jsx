import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Search, CheckCircle2, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const CreateInvoiceModal = ({ isOpen, onClose, onInvoiceCreated, defaultPatient = null }) => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(defaultPatient);

  // Invoice Items
  const [items, setItems] = useState([
    {
      name: 'Doctor Consultation Fee',
      category: 'consultation',
      quantity: 1,
      unit_price: activeClinic?.consultation_fee || 500,
      tax_rate: 0,
      total_amount: activeClinic?.consultation_fee || 500,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'cash' | 'upi' | 'card' | 'net_banking'
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search patient
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/v1/patients/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data?.patients || []);
      } catch (err) {
        console.warn('Patient search warning:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddItem = (category = 'consultation', name = 'Medical Service', price = 300) => {
    setItems([
      ...items,
      {
        name,
        category,
        quantity: 1,
        unit_price: price,
        tax_rate: 0,
        total_amount: price,
      },
    ]);
  };

  const handleUpdateItem = (index, field, val) => {
    const list = [...items];
    list[index][field] = val;
    if (field === 'quantity' || field === 'unit_price') {
      const q = Number(field === 'quantity' ? val : list[index].quantity) || 1;
      const p = Number(field === 'unit_price' ? val : list[index].unit_price) || 0;
      list[index].total_amount = q * p;
    }
    setItems(list);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
  const totalPayable = Math.max(0, subtotal - Number(discountAmount));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeClinic) {
      showToast('Please select active clinic', 'warning');
      return;
    }
    if (!selectedPatient?._id) {
      showToast('Please select a patient for this bill', 'warning');
      return;
    }
    if (items.length === 0) {
      showToast('Please add at least one line item', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clinic_id: activeClinic._id,
        patient_id: selectedPatient._id,
        items,
        subtotal,
        discount_amount: Number(discountAmount) || 0,
        tax_amount: 0,
        total_payable: totalPayable,
        paid_amount: paymentStatus === 'paid' ? totalPayable : 0,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        transaction_reference: transactionRef,
        notes,
      };

      const res = await api.post('/v1/invoices', payload);
      showToast(`Invoice #${res.data?.invoice?.invoice_number} created successfully!`);
      if (onInvoiceCreated) {
        onInvoiceCreated(res.data?.invoice);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to generate invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Clinic Bill / Tax Invoice"
      subtitle="Issue itemized medical bill with instant receipt generation"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Lookup */}
        {!selectedPatient ? (
          <div className="space-y-2">
            <Input
              label="Select Patient for Invoice"
              placeholder="Search patient by mobile / name / UHID..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto bg-white shadow-sm">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-teal-50 transition text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">{p.phone}</span>
                    </div>
                    <span className="text-teal-700 font-bold">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                Billing To:
              </span>
              <p className="font-bold text-slate-900 text-sm">{selectedPatient.name}</p>
              <p className="text-slate-600 font-mono">
                {selectedPatient.phone} • UHID: {selectedPatient.uhid}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Change Patient
            </button>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Billed Items & Services
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddItem('procedure', 'Dressing / Minor Procedure', 300)}
                className="text-[11px] font-bold text-teal-700 hover:underline"
              >
                + Add Procedure
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('vaccine', 'Vaccination Charge', 800)}
                className="text-[11px] font-bold text-teal-700 hover:underline"
              >
                + Add Vaccine
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('other', 'Service Item', 200)}
                className="text-[11px] font-bold text-slate-600 hover:underline"
              >
                + Custom Item
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-3"
              >
                <span className="font-mono text-slate-400">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                  required
                />
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                    className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleUpdateItem(idx, 'unit_price', Number(e.target.value))}
                    className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-right"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Calculation Box */}
        <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Discount (₹)</span>
            <input
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              className="w-24 px-2 py-1 bg-slate-800 rounded border border-slate-700 text-right font-bold text-teal-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
            <span>Total Payable Amount</span>
            <span className="font-mono text-teal-400 text-base">
              {formatCurrency(totalPayable)}
            </span>
          </div>
        </div>

        {/* Payment Mode & Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'upi', label: 'UPI / QR Code' },
              { value: 'cash', label: 'Cash Desk' },
              { value: 'card', label: 'Credit / Debit Card' },
              { value: 'net_banking', label: 'Net Banking' },
            ]}
          />

          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            options={[
              { value: 'paid', label: 'Paid in Full' },
              { value: 'unpaid', label: 'Unpaid / Due' },
            ]}
          />

          <Input
            label="Transaction Ref / UPI UTR"
            placeholder="e.g. 948271038194"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={!selectedPatient}
            icon={CheckCircle2}
          >
            Generate & Print Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
};
