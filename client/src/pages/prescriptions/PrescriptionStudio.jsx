import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Share2,
  Save,
  Clock,
  User,
  Heart,
  Activity,
  Bookmark,
  CheckCircle,
  FileText,
  Search,
  Calendar,
  AlertCircle,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LetterheadPreview } from '../../components/letterhead/LetterheadPreview';
import {
  DOSAGE_FREQUENCIES,
  DOSAGE_FORMS,
  TIMINGS,
  formatDate,
} from '../../utils/formatters';

const COMMON_COMPLAINTS = [
  'Fever',
  'Dry Cough',
  'Productive Cough',
  'Cold & Sneezing',
  'Headache',
  'Body Ache',
  'Sore Throat',
  'Acidity & Heartburn',
  'Abdominal Pain',
  'Loose Stools',
  'Vomiting',
  'Generalized Weakness',
  'Joint Pain',
];

const COMMON_DIAGNOSES = [
  'Viral Upper Respiratory Infection (URI)',
  'Acute Bronchitis',
  'Acute Gastroenteritis',
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Gastroesophageal Reflux Disease (GERD)',
  'Urinary Tract Infection (UTI)',
  'Migraine Headache',
  'Allergic Rhinitis',
  'Osteoarthritis',
];

const COMMON_INVESTIGATIONS = [
  'Complete Blood Count (CBC)',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Fasting & Post-Prandial Blood Sugar',
  'HbA1c Glycated Hemoglobin',
  'Lipid Profile',
  'Urine Routine & Microscopic',
  'Chest X-Ray PA View',
  '12-Lead Electrocardiogram (ECG)',
  'Ultrasound Whole Abdomen (USG)',
  'Thyroid Profile (T3, T4, TSH)',
];

export const PrescriptionStudio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeClinic } = useAuth();
  const { showToast } = useToast();

  // Route state (if coming from queue)
  const incomingPatientId = location.state?.patientId;
  const incomingAppointmentId = location.state?.appointmentId;
  const incomingComplaint = location.state?.chiefComplaint;

  // Selected Patient
  const [patient, setPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);

  // Prescription Form Fields
  const [complaints, setComplaints] = useState(incomingComplaint ? [incomingComplaint] : []);
  const [complaintInput, setComplaintInput] = useState('');
  const [diagnosis, setDiagnosis] = useState([]);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [vitalsSnapshot, setVitalsSnapshot] = useState({});

  // Medicines List
  const [medicines, setMedicines] = useState([
    {
      name: 'Paracetamol 650mg',
      generic_name: 'Paracetamol',
      dosage_form: 'Tablet',
      dose: '1 Tab',
      frequency: '1-0-1',
      timing: 'After Food',
      duration_days: 3,
      instructions: 'Take after meal when fever occurs',
    },
  ]);

  // Drug Search Helper
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [drugSearchResults, setDrugSearchResults] = useState([]);

  // Investigations & Advice
  const [investigations, setInvestigations] = useState([]);
  const [generalAdvice, setGeneralAdvice] = useState(
    'Drink plenty of warm fluids, rest well, and maintain a light, nutritious diet.'
  );
  const [followUpDays, setFollowUpDays] = useState(5);

  // Template Modal
  const [templates, setTemplates] = useState([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Live Letterhead Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial patient or load templates
  useEffect(() => {
    if (incomingPatientId) {
      fetchPatientDetails(incomingPatientId);
    }
    fetchTemplates();
  }, [incomingPatientId]);

  const fetchPatientDetails = async (id) => {
    try {
      const res = await api.get(`/v1/patients/${id}`);
      setPatient(res.data?.patient);

      // Fetch patient's past prescriptions
      const rxRes = await api.get(`/v1/prescriptions/patient/${id}`);
      setPatientHistory(rxRes.data?.prescriptions || []);

      // Fetch latest vitals
      const vitalsRes = await api.get(`/v1/patients/${id}/vitals`);
      const timeline = vitalsRes.data?.timeline || [];
      if (timeline.length > 0) {
        setVitalsSnapshot(timeline[0]);
      }
    } catch (err) {
      console.warn('Patient details fetch warning:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/v1/templates');
      setTemplates(res.data?.templates || []);
    } catch (err) {
      console.warn('Templates fetch warning:', err);
    }
  };

  // Search Patient
  const handleSearchPatient = async (query) => {
    setPatientSearch(query);
    if (!query || query.length < 2) {
      setPatientResults([]);
      return;
    }
    try {
      const res = await api.get(`/v1/patients/search?q=${encodeURIComponent(query)}`);
      setPatientResults(res.data?.patients || []);
    } catch (err) {
      console.warn('Search patients warning:', err);
    }
  };

  // Search Drug in database
  const handleSearchDrugs = async (query) => {
    setDrugSearchQuery(query);
    if (!query || query.length < 2) {
      setDrugSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/v1/medicines/search?q=${encodeURIComponent(query)}`);
      setDrugSearchResults(res.data?.medicines || []);
    } catch (err) {
      console.warn('Search medicines warning:', err);
    }
  };

  // Add Medicine to Prescription
  const handleAddMedicine = (medObj = null) => {
    const newMed = medObj || {
      name: drugSearchQuery || 'New Medicine',
      generic_name: '',
      dosage_form: 'Tablet',
      dose: '1 Tab',
      frequency: '1-0-1',
      timing: 'After Food',
      duration_days: 5,
      instructions: '',
    };
    setMedicines([...medicines, newMed]);
    setDrugSearchQuery('');
    setDrugSearchResults([]);
  };

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  // Apply Rx Template
  const handleApplyTemplate = (tmpl) => {
    if (tmpl.chief_complaints?.length) setComplaints(tmpl.chief_complaints);
    if (tmpl.diagnosis?.length) setDiagnosis(tmpl.diagnosis);
    if (tmpl.medicines?.length) setMedicines(tmpl.medicines);
    if (tmpl.investigations?.length) setInvestigations(tmpl.investigations);
    if (tmpl.general_advice) setGeneralAdvice(tmpl.general_advice);
    showToast(`Template "${tmpl.name}" applied successfully!`);
  };

  // Save current prescription as a reusable template
  const handleSaveAsTemplate = async () => {
    if (!templateName) {
      showToast('Please enter a name for the template', 'warning');
      return;
    }
    try {
      await api.post('/v1/templates', {
        name: templateName,
        chief_complaints: complaints,
        diagnosis: diagnosis,
        medicines: medicines,
        investigations: investigations,
        general_advice: generalAdvice,
      });
      showToast(`Template "${templateName}" saved!`);
      setIsTemplateModalOpen(false);
      setTemplateName('');
      fetchTemplates();
    } catch (err) {
      showToast(err.message || 'Failed to save template', 'error');
    }
  };

  // Issue & Finalize Prescription
  const handleIssuePrescription = async (andPrint = false) => {
    if (!activeClinic) {
      showToast('Please select an active clinic first', 'warning');
      return;
    }
    if (!patient?._id) {
      showToast('Please select a patient before issuing the prescription', 'warning');
      return;
    }
    if (medicines.length === 0 && complaints.length === 0 && diagnosis.length === 0) {
      showToast('Prescription must contain at least complaints, diagnosis, or medicines', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + Number(followUpDays));

      const payload = {
        clinic_id: activeClinic._id,
        patient_id: patient._id,
        appointment_id: incomingAppointmentId || undefined,
        vitals_snapshot: vitalsSnapshot,
        chief_complaints: complaints,
        diagnosis: diagnosis,
        clinical_notes: clinicalNotes,
        medicines: medicines,
        investigations: investigations,
        general_advice: generalAdvice,
        follow_up_date: followUpDate.toISOString(),
      };

      const res = await api.post('/v1/prescriptions', payload);
      const issuedRx = res.data?.prescription;

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast(`Prescription #${issuedRx?.prescription_number || ''} issued successfully!`);

      if (andPrint) {
        window.print();
      }

      navigate(`/prescriptions/${issuedRx._id}`);
    } catch (err) {
      showToast(err.message || 'Failed to issue prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedFollowUpDate = new Date();
  calculatedFollowUpDate.setDate(calculatedFollowUpDate.getDate() + Number(followUpDays));

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-teal-600" />
            Speed Prescription Studio (Docpa EMR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ultra-fast consultation suite (under 30s Rx generation) with Indian drug database & templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Apply Template Dropdown */}
          {templates.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const tmpl = templates.find((t) => t._id === e.target.value);
                  if (tmpl) handleApplyTemplate(tmpl);
                }}
                defaultValue=""
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs focus:outline-none"
              >
                <option value="" disabled>
                  ⚡ Load Rx Template Kit...
                </option>
                {templates.map((tmpl) => (
                  <option key={tmpl._id} value={tmpl._id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={Bookmark}
            onClick={() => setIsTemplateModalOpen(true)}
          >
            Save as Template
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview Letterhead
          </Button>

          <Button
            size="sm"
            loading={submitting}
            icon={Printer}
            onClick={() => handleIssuePrescription(true)}
            className="shadow-sm"
          >
            Issue & Print Rx
          </Button>
        </div>
      </div>

      {/* 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Patient Info, Vitals Snapshot, Timeline */}
        <div className="lg:col-span-4 space-y-4">
          {/* Patient Card */}
          <Card className="p-4 bg-gradient-to-br from-slate-50 to-white">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Patient Identification
            </span>

            {!patient ? (
              <div className="space-y-3">
                <Input
                  placeholder="Lookup Patient (Phone / Name / UHID)..."
                  icon={Search}
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                />
                {patientResults.length > 0 && (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-sm">
                    {patientResults.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setPatient(p);
                          fetchPatientDetails(p._id);
                          setPatientResults([]);
                          setPatientSearch('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-teal-50 transition text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.phone} • UHID: {p.uhid}
                          </p>
                        </div>
                        <span className="text-teal-700 font-bold text-[11px]">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{patient.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {patient.phone} • {patient.age_years || '-'} Y / {patient.gender}
                    </p>
                    <p className="text-[10px] text-teal-800 font-mono font-bold mt-0.5">
                      UHID: {patient.uhid || 'UHID-000000'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPatient(null)}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Patient Medical Alerts */}
                {(patient.allergies?.length > 0 || patient.chronic_conditions?.length > 0) && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs space-y-1">
                    {patient.allergies?.length > 0 && (
                      <p className="text-rose-900 font-medium">
                        <strong className="text-rose-700">Allergies: </strong>
                        {patient.allergies.join(', ')}
                      </p>
                    )}
                    {patient.chronic_conditions?.length > 0 && (
                      <p className="text-slate-800 font-medium">
                        <strong className="text-slate-600">Chronic: </strong>
                        {patient.chronic_conditions.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Vitals Snapshot */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Vitals Snapshot
              </span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">BP (mmHg)</span>
                <input
                  type="text"
                  placeholder="120/80"
                  value={
                    vitalsSnapshot.bp_systolic
                      ? `${vitalsSnapshot.bp_systolic}/${vitalsSnapshot.bp_diastolic || 80}`
                      : ''
                  }
                  onChange={(e) => {
                    const [sys, dia] = e.target.value.split('/');
                    setVitalsSnapshot((prev) => ({
                      ...prev,
                      bp_systolic: sys ? Number(sys) : undefined,
                      bp_diastolic: dia ? Number(dia) : undefined,
                    }));
                  }}
                  className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Pulse (bpm)</span>
                <input
                  type="number"
                  placeholder="72"
                  value={vitalsSnapshot.pulse_rate || ''}
                  onChange={(e) =>
                    setVitalsSnapshot({ ...vitalsSnapshot, pulse_rate: Number(e.target.value) })
                  }
                  className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Temp (°F)</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitalsSnapshot.temperature_f || ''}
                  onChange={(e) =>
                    setVitalsSnapshot({ ...vitalsSnapshot, temperature_f: Number(e.target.value) })
                  }
                  className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Weight (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="65"
                  value={vitalsSnapshot.weight_kg || ''}
                  onChange={(e) =>
                    setVitalsSnapshot({ ...vitalsSnapshot, weight_kg: Number(e.target.value) })
                  }
                  className="font-bold text-slate-900 w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Past Visits Summary */}
          {patient && patientHistory.length > 0 && (
            <Card className="p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Previous Prescriptions ({patientHistory.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {patientHistory.slice(0, 4).map((pastRx) => (
                  <div
                    key={pastRx._id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition text-xs cursor-pointer"
                    onClick={() => {
                      if (pastRx.medicines?.length) setMedicines(pastRx.medicines);
                      showToast('Medications copied from previous prescription!');
                    }}
                  >
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{formatDate(pastRx.createdAt)}</span>
                      <span className="text-[10px] text-teal-700 font-semibold">Copy Meds</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Diagnosis: {pastRx.diagnosis?.join(', ') || 'General Consultation'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Prescription Studio Editor */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Chief Complaints Section */}
          <Card className="p-5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Chief Complaints
            </label>

            {/* Quick complaint chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_COMPLAINTS.map((item) => {
                const selected = complaints.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setComplaints(complaints.filter((c) => c !== item));
                      } else {
                        setComplaints([...complaints, item]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      selected
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type custom complaint & hit Add..."
                value={complaintInput}
                onChange={(e) => setComplaintInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && complaintInput.trim()) {
                    e.preventDefault();
                    setComplaints([...complaints, complaintInput.trim()]);
                    setComplaintInput('');
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (complaintInput.trim()) {
                    setComplaints([...complaints, complaintInput.trim()]);
                    setComplaintInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
          </Card>

          {/* 2. Clinical Diagnosis Section */}
          <Card className="p-5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Clinical Diagnosis (ICD-10)
            </label>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_DIAGNOSES.map((item) => {
                const selected = diagnosis.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setDiagnosis(diagnosis.filter((d) => d !== item));
                      } else {
                        setDiagnosis([...diagnosis, item]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      selected
                        ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type custom diagnosis & hit Add..."
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && diagnosisInput.trim()) {
                    e.preventDefault();
                    setDiagnosis([...diagnosis, diagnosisInput.trim()]);
                    setDiagnosisInput('');
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (diagnosisInput.trim()) {
                    setDiagnosis([...diagnosis, diagnosisInput.trim()]);
                    setDiagnosisInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
          </Card>

          {/* 3. Speed Medicine Engine (The Core Feature) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black italic text-teal-700">℞</span>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Prescribed Medications ({medicines.length})
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => handleAddMedicine()}
              >
                Add Blank Row
              </Button>
            </div>

            {/* Quick Drug Search bar */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Instant Drug Search (e.g. Augmentin, Pantocid, Azithral, Montair, Dolo)..."
                value={drugSearchQuery}
                onChange={(e) => handleSearchDrugs(e.target.value)}
                className="w-full pl-9 pr-24 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => handleAddMedicine()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
              >
                + Add Custom
              </button>

              {/* Drug suggestions dropdown */}
              {drugSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {drugSearchResults.map((med) => (
                    <button
                      key={med._id}
                      type="button"
                      onClick={() =>
                        handleAddMedicine({
                          name: med.name,
                          generic_name: med.generic_name,
                          dosage_form: med.dosage_form || 'Tablet',
                          dose: med.default_dose || '1 Tab',
                          frequency: med.default_frequency || '1-0-1',
                          timing: med.default_timing || 'After Food',
                          duration_days: med.default_duration_days || 5,
                          instructions: med.default_instructions || '',
                        })
                      }
                      className="w-full text-left p-3 hover:bg-teal-50 transition text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>
                        {med.generic_name && (
                          <span className="text-[11px] text-slate-500 ml-2 font-normal">
                            ({med.generic_name})
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {med.dosage_form} • {med.strength || 'Standard'}
                        </span>
                      </div>
                      <span className="text-teal-700 font-bold px-2 py-1 bg-teal-50 rounded-lg">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Medicine Rows */}
            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-mono font-bold text-slate-400 text-xs">
                      {idx + 1}.
                    </span>

                    {/* Drug Name & Form */}
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />

                    <select
                      value={med.dosage_form}
                      onChange={(e) => handleUpdateMedicine(idx, 'dosage_form', e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    >
                      {DOSAGE_FORMS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete drug"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Frequency Pills & Timing Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pl-8">
                    {/* Frequency */}
                    <div>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800"
                      >
                        {DOSAGE_FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.value} ({freq.label.split('(')[1]?.replace(')', '') || freq.value})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Food Timing */}
                    <div>
                      <select
                        value={med.timing}
                        onChange={(e) => handleUpdateMedicine(idx, 'timing', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800"
                      >
                        {TIMINGS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration in Days */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={med.duration_days}
                        onChange={(e) =>
                          handleUpdateMedicine(idx, 'duration_days', Number(e.target.value))
                        }
                        className="w-16 px-2 py-1.5 text-xs font-bold text-center rounded-lg border border-slate-200 bg-white"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">Days</span>
                    </div>

                    {/* Custom Instruction */}
                    <div>
                      <input
                        type="text"
                        placeholder="Instructions (e.g. with water)"
                        value={med.instructions}
                        onChange={(e) =>
                          handleUpdateMedicine(idx, 'instructions', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Investigations Checklist */}
          <Card className="p-5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Diagnostic Investigations / Lab Tests
            </label>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_INVESTIGATIONS.map((test) => {
                const selected = investigations.includes(test);
                return (
                  <button
                    key={test}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setInvestigations(investigations.filter((i) => i !== test));
                      } else {
                        setInvestigations([...investigations, test]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      selected
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {test}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 5. General Advice & Follow-up */}
          <Card className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  General Advice & Diet Instructions
                </label>
                <textarea
                  rows={2}
                  value={generalAdvice}
                  onChange={(e) => setGeneralAdvice(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  Next Follow-up
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(Number(e.target.value))}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  >
                    <option value={3}>After 3 Days</option>
                    <option value={5}>After 5 Days</option>
                    <option value={7}>After 1 Week</option>
                    <option value={14}>After 2 Weeks</option>
                    <option value={30}>After 1 Month</option>
                    <option value={0}>No Follow-up Required</option>
                  </select>
                </div>
                {followUpDays > 0 && (
                  <p className="text-[10px] text-teal-700 font-semibold mt-1">
                    Date: {formatDate(calculatedFollowUpDate)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
            <div className="text-xs">
              <span className="text-slate-400">Total Items: </span>
              <strong>{medicines.length} Medicines</strong>
              {investigations.length > 0 && <span> • {investigations.length} Tests</span>}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="dark"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                Preview Letterhead
              </Button>
              <Button
                size="md"
                loading={submitting}
                icon={Printer}
                onClick={() => handleIssuePrescription(true)}
                className="shadow-lg shadow-teal-500/20"
              >
                Issue & Print Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      {isTemplateModalOpen && (
        <Modal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          title="Save as 1-Click Rx Template"
          subtitle="Save this clinical prescription set to reuse instantly in future consultations"
        >
          <div className="space-y-4">
            <Input
              label="Template Name"
              placeholder="e.g. Viral Fever Starter Kit, Acute URTI, Hypertension Init"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              autoFocus
            />
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              This template will save {medicines.length} medicines, {complaints.length} complaints,
              and advice notes for rapid 1-click application.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAsTemplate} icon={Bookmark}>
                Save Template
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fullscreen Letterhead Live Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Prescription Letterhead Preview"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <LetterheadPreview
              clinic={activeClinic}
              doctor={user}
              patient={patient}
              vitals={vitalsSnapshot}
              complaints={complaints}
              diagnosis={diagnosis}
              medicines={medicines}
              investigations={investigations}
              advice={generalAdvice}
              followUpDate={followUpDays > 0 ? calculatedFollowUpDate : null}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 no-print">
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
              <Button
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
