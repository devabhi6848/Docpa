import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Stethoscope,
  FileText,
  Activity,
  Calendar,
  CreditCard,
  Phone,
  Baby,
  Download,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';

export const PatientPortal = () => {
  const { patientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const res = await axios.get(`/api/v1/portal/patient/${patientId}`);
        setData(res.data?.data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient health portal');
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Accessing your digital medical records...
        </div>
      </div>
    );
  }

  if (error || !data?.patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md text-center">
          <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Medical Portal Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1">
            {error || 'Patient record could not be verified.'}
          </p>
        </div>
      </div>
    );
  }

  const patient = data.patient || {};
  const prescriptions = data.prescriptions || [];
  const vaccines = data.vaccines || [];
  const invoices = data.invoices || [];
  const clinic = data.clinic || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base">Docpa Health Portal</span>
              <p className="text-[10px] text-slate-400">Digital Health Record</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">{clinic.name || 'Docpa Clinic'}</span>
            <p className="text-[10px] text-slate-400">+91 {clinic.phone}</p>
          </div>
        </div>
      </header>

      {/* Patient Welcome Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block mb-1">
                Patient Medical Timeline
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">{patient.name}</h1>
              <p className="text-xs text-slate-300 font-mono mt-1">
                UHID: {patient.uhid} • {patient.age_years} Y / {patient.gender} • Blood:{' '}
                {patient.blood_group || 'Unknown'}
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-xs">
              <p className="font-bold text-teal-300">Registered Mobile</p>
              <p className="font-mono text-white">+91 {patient.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Records Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Prescriptions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Digital Prescriptions ({prescriptions.length})
            </h2>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No prescriptions on file yet.
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-premium transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-bold text-teal-800 text-sm">
                        Rx #{rx.prescription_number}
                      </span>
                      <p className="text-xs text-slate-500">Issued on {formatDate(rx.createdAt)}</p>
                    </div>

                    <Link
                      to={`/prescriptions/${rx._id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      View Official Letterhead Rx
                    </Link>
                  </div>

                  <div className="pt-3 text-xs space-y-2">
                    {rx.diagnosis?.length > 0 && (
                      <p className="text-slate-800 font-semibold">
                        <strong className="text-slate-500">Diagnosis: </strong>
                        {rx.diagnosis.join(', ')}
                      </p>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Prescribed Medications ({rx.medicines?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {rx.medicines?.map((med, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between font-semibold text-slate-800"
                          >
                            <span>
                              {idx + 1}. {med.name}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {med.frequency} • {med.timing} • {med.duration_days}d
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rx.follow_up_date && (
                      <p className="text-teal-800 font-bold text-[11px]">
                        Next Follow-up Date: {formatDate(rx.follow_up_date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Vaccines Section (if applicable) */}
        {vaccines.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Baby className="w-5 h-5 text-teal-600" />
              Vaccine Schedule ({vaccines.length})
            </h2>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600">
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Vaccine</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vaccines.map((v) => (
                    <tr key={v._id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{v.age_milestone}</td>
                      <td className="py-3 px-4 font-semibold text-teal-800">{v.vaccine_name}</td>
                      <td className="py-3 px-4">{formatDate(v.due_date)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'given'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
