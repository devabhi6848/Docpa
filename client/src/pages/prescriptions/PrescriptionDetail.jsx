import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  FileText,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { LetterheadPreview } from '../../components/letterhead/LetterheadPreview';
import { formatDate } from '../../utils/formatters';

export const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeClinic } = useAuth();
  const { showToast } = useToast();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/v1/prescriptions/${id}`);
        setPrescription(res.data?.prescription);
      } catch (err) {
        showToast(err.message || 'Failed to load prescription', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const patientPhone = prescription?.patient_id?.phone;
    const patientName = prescription?.patient_id?.name || 'Patient';
    const rxNo = prescription?.prescription_number;
    const clinicName = activeClinic?.name || 'Docpa Clinic';

    const text = encodeURIComponent(
      `Hello ${patientName},\n\nYour prescription (Rx #${rxNo}) from ${clinicName} is ready.\n\nView and download your digital prescription here:\n${window.location.origin}/portal/patient/${prescription?.patient_id?._id}\n\nTake care & get well soon!`
    );

    const whatsappUrl = `https://wa.me/${patientPhone ? '91' + patientPhone.replace(/\D/g, '') : ''}?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading medical prescription details...
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="py-24 text-center text-slate-500">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Prescription Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate('/queue')} className="mt-4">
          Back to OPD Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Prescription #{prescription.prescription_number}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Issued
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Created on {formatDate(prescription.createdAt)} for {prescription.patient_id?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={MessageCircle}
            onClick={handleShareWhatsApp}
            className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
          >
            WhatsApp Rx
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/portal/patient/${prescription.patient_id?._id}`
              );
              showToast('Patient portal link copied to clipboard!');
            }}
            icon={Share2}
          >
            Copy Link
          </Button>

          <Button size="sm" icon={Printer} onClick={handlePrint} className="shadow-sm">
            Print Letterhead (A4 / Thermal)
          </Button>
        </div>
      </div>

      {/* Letterhead Preview Component */}
      <LetterheadPreview
        clinic={prescription.clinic_id || activeClinic}
        doctor={prescription.doctor_id || user}
        patient={prescription.patient_id}
        vitals={prescription.vitals_snapshot}
        complaints={prescription.chief_complaints}
        diagnosis={prescription.diagnosis}
        medicines={prescription.medicines}
        investigations={prescription.investigations}
        advice={prescription.general_advice}
        followUpDate={prescription.follow_up_date}
        prescriptionNumber={prescription.prescription_number}
        createdAt={prescription.createdAt}
      />
    </div>
  );
};
