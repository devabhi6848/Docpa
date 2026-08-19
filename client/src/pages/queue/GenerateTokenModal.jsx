import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Sparkles, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const GenerateTokenModal = ({ isOpen, onClose, onTokenCreated }) => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // New patient quick form mode
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [quickPatient, setQuickPatient] = useState({
    name: '',
    phone: '',
    gender: 'male',
    age_years: '',
    blood_group: 'unknown',
  });

  // Token configuration
  const [visitType, setVisitType] = useState('new_visit');
  const [priority, setPriority] = useState('normal');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search patients as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/v1/patients/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data?.patients || []);
      } catch (err) {
        console.warn('Patient search warning:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    setIsQuickAdd(false);
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    if (!activeClinic) {
      showToast('Please select an active clinic first', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let patientId = selectedPatient?._id;

      // If in quick add mode, create patient first
      if (isQuickAdd && !patientId) {
        if (!quickPatient.name || !quickPatient.phone) {
          showToast('Please provide patient name and phone number', 'warning');
          setSubmitting(false);
          return;
        }

        const patientRes = await api.post('/v1/patients', {
          ...quickPatient,
          clinic_id: activeClinic._id,
          age_years: Number(quickPatient.age_years) || 0,
        });
        patientId = patientRes.data?.patient?._id;
      }

      if (!patientId) {
        showToast('Please select or register a patient for the token', 'warning');
        setSubmitting(false);
        return;
      }

      const tokenRes = await api.post('/v1/queue/token', {
        clinic_id: activeClinic._id,
        patient_id: patientId,
        visit_type: visitType,
        priority: priority,
        chief_complaint: chiefComplaint,
      });

      showToast(`Token #${tokenRes.data?.token?.token_number} generated successfully!`);
      onTokenCreated(tokenRes.data?.token);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to generate OPD token', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate OPD Queue Token"
      subtitle="Search existing patient or quickly register walk-in patient"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleGenerateToken} className="space-y-4">
        {/* Patient Selection State */}
        {!selectedPatient && !isQuickAdd ? (
          <div className="space-y-3">
            <Input
              label="Search Patient by Phone / UHID / Name"
              placeholder="e.g. 9876543210 or Ramesh"
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            {/* Live Search Results */}
            {searching && (
              <p className="text-xs text-slate-400 py-1">Searching patient directory...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-sm">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className="w-full text-left p-3 hover:bg-teal-50 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">{p.phone}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        UHID: {p.uhid || '-'} • {p.age_years || '-'} Y / {p.gender}
                      </span>
                    </div>
                    <span className="text-teal-700 font-semibold px-2 py-1 bg-teal-100/70 rounded-md">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center justify-between border border-slate-200">
                <span>No existing record found for "{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickAdd(true);
                    setQuickPatient((prev) => ({
                      ...prev,
                      phone: /^\d+$/.test(searchQuery) ? searchQuery : '',
                      name: !/^\d+$/.test(searchQuery) ? searchQuery : '',
                    }));
                  }}
                  className="font-bold text-teal-700 hover:underline"
                >
                  + Add New Patient
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsQuickAdd(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                <UserPlus className="w-4 h-4" />
                Register New Walk-in Patient
              </button>
            </div>
          </div>
        ) : selectedPatient ? (
          /* Selected Patient View */
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                Selected Patient
              </span>
              <p className="text-sm font-bold text-slate-900">{selectedPatient.name}</p>
              <p className="text-xs text-slate-600 font-mono">
                {selectedPatient.phone} • UHID: {selectedPatient.uhid} • {selectedPatient.age_years} Y /{' '}
                {selectedPatient.gender}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          /* Quick Add Patient Form */
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quick Walk-in Registration
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAdd(false)}
                className="text-xs text-slate-500 hover:underline"
              >
                Back to Search
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Patient Name"
                placeholder="Ramesh Gupta"
                value={quickPatient.name}
                onChange={(e) => setQuickPatient({ ...quickPatient, name: e.target.value })}
                required
              />
              <Input
                label="Mobile Number"
                placeholder="9876543210"
                value={quickPatient.phone}
                onChange={(e) => setQuickPatient({ ...quickPatient, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Gender"
                value={quickPatient.gender}
                onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value })}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Age (Years)"
                type="number"
                placeholder="32"
                value={quickPatient.age_years}
                onChange={(e) => setQuickPatient({ ...quickPatient, age_years: e.target.value })}
              />
              <Select
                label="Blood Group"
                value={quickPatient.blood_group}
                onChange={(e) => setQuickPatient({ ...quickPatient, blood_group: e.target.value })}
                options={[
                  { value: 'unknown', label: 'Unknown' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Token Details */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Select
            label="Visit Type"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
            options={[
              { value: 'new_visit', label: 'New Consultation' },
              { value: 'follow_up', label: 'Follow-up Visit' },
              { value: 'emergency', label: 'Emergency / Triage' },
              { value: 'report_review', label: 'Lab Report Review' },
              { value: 'vaccination', label: 'Vaccination Only' },
            ]}
          />
          <Select
            label="Queue Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'urgent', label: 'Urgent Priority' },
              { value: 'emergency', label: 'Emergency (Top Queue)' },
            ]}
          />
        </div>

        <Input
          label="Chief Complaint / Reason for Visit"
          placeholder="e.g. Fever for 3 days, cough, headache"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={!selectedPatient && !isQuickAdd}
            icon={Sparkles}
          >
            Issue OPD Token
          </Button>
        </div>
      </form>
    </Modal>
  );
};
