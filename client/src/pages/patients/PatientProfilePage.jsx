import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Baby,
  Sparkles,
  Plus,
  ArrowLeft,
  Heart,
  Weight,
  Thermometer,
  Wind,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { VitalsRecordModal } from '../queue/VitalsRecordModal';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';

export const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeClinic, isDoctor } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitalsTimeline, setVitalsTimeline] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active tab in profile
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'vitals' | 'vaccines' | 'growth'

  // Modals
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  const fetchFullProfile = async () => {
    setLoading(true);
    try {
      // 1. Patient basic data
      const pRes = await api.get(`/v1/patients/${id}`);
      setPatient(pRes.data?.patient);

      // 2. Prescriptions history
      const rxRes = await api.get(`/v1/prescriptions/patient/${id}`);
      setPrescriptions(rxRes.data?.prescriptions || []);

      // 3. Vitals timeline
      const vitalsRes = await api.get(`/v1/patients/${id}/vitals`);
      setVitalsTimeline(vitalsRes.data?.timeline || []);

      // 4. Vaccines (if pediatric or applicable)
      try {
        const vacRes = await api.get(`/v1/vaccines/patient/${id}`);
        setVaccines(vacRes.data?.schedule || []);
      } catch (e) {
        // Ignore if no vaccines
      }

      // 5. Growth records
      try {
        const grRes = await api.get(`/v1/growth/patient/${id}`);
        setGrowthRecords(grRes.data?.history || []);
      } catch (e) {
        // Ignore
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch patient profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading patient 360 profile & medical timeline...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-24 text-center text-slate-500">
        <h2 className="text-lg font-bold">Patient Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate('/patients')} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {patient.name}
              {patient.blood_group && patient.blood_group !== 'unknown' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold">
                  {patient.blood_group}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              UHID: {patient.uhid} • Mobile: +91 {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Activity}
            onClick={() => setIsVitalsModalOpen(true)}
          >
            Record Vitals
          </Button>

          <Button
            size="sm"
            icon={Sparkles}
            onClick={() =>
              navigate('/prescriptions/new', {
                state: {
                  patientId: patient._id,
                  patientData: patient,
                },
              })
            }
            className="shadow-sm"
          >
            Start Consultation (Rx)
          </Button>
        </div>
      </div>

      {/* Patient Demographic & Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Demographics
          </span>
          <p className="text-sm font-bold text-slate-900 capitalize">
            {patient.age_years || '-'} Years • {patient.gender}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {formatDate(patient.createdAt)}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Guardian & Contact
          </span>
          <p className="text-sm font-bold text-slate-900">
            {patient.guardian_name || 'Self'} ({patient.guardian_relationship || 'Self'})
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {patient.address?.city ? `${patient.address.city}, ${patient.address.pincode || ''}` : 'Local'}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-rose-50/50 to-white border-rose-100">
          <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1">
            Allergies & Sensitivities
          </span>
          <p className="text-xs font-semibold text-rose-900">
            {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'No known drug allergies'}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
          <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
            Chronic Medical Conditions
          </span>
          <p className="text-xs font-semibold text-slate-800">
            {patient.chronic_conditions?.length > 0
              ? patient.chronic_conditions.join(', ')
              : 'None documented'}
          </p>
        </Card>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: FileText },
          { id: 'vitals', label: `Vitals Timeline (${vitalsTimeline.length})`, icon: Activity },
          { id: 'vaccines', label: `Immunization (${vaccines.length})`, icon: Baby },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Prescriptions History */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No prescriptions issued yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Start a consultation to write the patient's first prescription.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <Card key={rx._id} className="p-5 hover:shadow-premium transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Rx #{rx.prescription_number}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Issued
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consulted on {formatDateTime(rx.createdAt)} by Dr.{' '}
                        {rx.doctor_id?.name || 'Doctor'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/prescriptions/${rx._id}`}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition"
                      >
                        View & Print Letterhead
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Diagnosis
                      </span>
                      <p className="font-semibold text-slate-800">
                        {rx.diagnosis?.join(', ') || 'General Consultation'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Medications ({rx.medicines?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {rx.medicines?.slice(0, 3).map((m, i) => (
                          <div key={i} className="text-slate-700 truncate">
                            • {m.name} ({m.frequency} • {m.duration_days}d)
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Advice & Follow-up
                      </span>
                      <p className="text-slate-600 truncate">{rx.general_advice || 'Take rest'}</p>
                      {rx.follow_up_date && (
                        <p className="text-teal-700 font-semibold mt-1">
                          Follow-up: {formatDate(rx.follow_up_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vitals Timeline */}
      {activeTab === 'vitals' && (
        <Card className="p-0 overflow-hidden">
          {vitalsTimeline.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No vitals logged yet. Click "Record Vitals" to add BP, pulse, temp, and BMI readings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Pulse Rate</th>
                    <th className="py-3 px-4">SpO2 Oxygen</th>
                    <th className="py-3 px-4">Temperature</th>
                    <th className="py-3 px-4">Weight / Height</th>
                    <th className="py-3 px-4">BMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitalsTimeline.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatDateTime(v.recorded_at || v.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {v.bp_systolic ? `${v.bp_systolic}/${v.bp_diastolic || 80} mmHg` : '-'}
                      </td>
                      <td className="py-3 px-4">{v.pulse_rate ? `${v.pulse_rate} bpm` : '-'}</td>
                      <td className="py-3 px-4">{v.spo2_percent ? `${v.spo2_percent}%` : '-'}</td>
                      <td className="py-3 px-4">{v.temperature_f ? `${v.temperature_f} °F` : '-'}</td>
                      <td className="py-3 px-4">
                        {v.weight_kg ? `${v.weight_kg}kg` : '-'} / {v.height_cm ? `${v.height_cm}cm` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {v.bmi ? (
                          <span className="font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px]">
                            {v.bmi}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Vaccines Schedule */}
      {activeTab === 'vaccines' && (
        <Card className="p-0 overflow-hidden">
          {vaccines.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No vaccination records scheduled. Open Pediatric module to initialize IAP standard chart.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Vaccine Name</th>
                    <th className="py-3 px-4">Disease Covered</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vaccines.map((vac) => (
                    <tr key={vac._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{vac.age_milestone}</td>
                      <td className="py-3 px-4 font-semibold text-teal-800">{vac.vaccine_name}</td>
                      <td className="py-3 px-4 text-slate-500">{vac.disease_covered}</td>
                      <td className="py-3 px-4">{formatDate(vac.due_date)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            vac.status === 'given'
                              ? 'bg-emerald-100 text-emerald-800'
                              : vac.status === 'due'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {vac.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Record Vitals Modal */}
      {isVitalsModalOpen && (
        <VitalsRecordModal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          patient={patient}
          onVitalsRecorded={() => {
            fetchFullProfile();
          }}
        />
      )}
    </div>
  );
};
