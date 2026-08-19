import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Wind, Weight, Ruler, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { calculateBMI, getBMICategory, getVitalsAlert } from '../../utils/formatters';

export const VitalsRecordModal = ({ isOpen, onClose, patient, onVitalsRecorded }) => {
  const { showToast } = useToast();

  const [vitals, setVitals] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    pulse_rate: '',
    temperature_f: '',
    spo2_percent: '',
    weight_kg: '',
    height_cm: '',
    head_circumference_cm: '',
    random_blood_sugar_mg_dl: '',
    notes: '',
  });

  const [bmi, setBmi] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto calculate BMI whenever weight or height changes
  useEffect(() => {
    const calculated = calculateBMI(Number(vitals.weight_kg), Number(vitals.height_cm));
    setBmi(calculated);
  }, [vitals.weight_kg, vitals.height_cm]);

  const handleChange = (field, val) => {
    setVitals((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) {
      showToast('Patient ID is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bp_systolic: vitals.bp_systolic ? Number(vitals.bp_systolic) : undefined,
        bp_diastolic: vitals.bp_diastolic ? Number(vitals.bp_diastolic) : undefined,
        pulse_rate: vitals.pulse_rate ? Number(vitals.pulse_rate) : undefined,
        temperature_f: vitals.temperature_f ? Number(vitals.temperature_f) : undefined,
        spo2_percent: vitals.spo2_percent ? Number(vitals.spo2_percent) : undefined,
        weight_kg: vitals.weight_kg ? Number(vitals.weight_kg) : undefined,
        height_cm: vitals.height_cm ? Number(vitals.height_cm) : undefined,
        head_circumference_cm: vitals.head_circumference_cm
          ? Number(vitals.head_circumference_cm)
          : undefined,
        random_blood_sugar_mg_dl: vitals.random_blood_sugar_mg_dl
          ? Number(vitals.random_blood_sugar_mg_dl)
          : undefined,
        notes: vitals.notes,
      };

      const res = await api.post(`/v1/patients/${patient._id}/vitals`, payload);
      showToast('Patient vitals recorded successfully!');
      if (onVitalsRecorded) {
        onVitalsRecorded(res.data?.vitals);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to record patient vitals', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Patient Vitals (Triage)"
      subtitle={`Patient: ${patient?.name || 'Walk-in'} • UHID: ${patient?.uhid || '-'}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blood Pressure & Pulse */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="BP Systolic (mmHg)"
            placeholder="120"
            type="number"
            icon={Heart}
            value={vitals.bp_systolic}
            onChange={(e) => handleChange('bp_systolic', e.target.value)}
          />
          <Input
            label="BP Diastolic (mmHg)"
            placeholder="80"
            type="number"
            value={vitals.bp_diastolic}
            onChange={(e) => handleChange('bp_diastolic', e.target.value)}
          />
          <Input
            label="Pulse Rate (bpm)"
            placeholder="72"
            type="number"
            icon={Activity}
            value={vitals.pulse_rate}
            onChange={(e) => handleChange('pulse_rate', e.target.value)}
          />
        </div>

        {/* Temperature & SpO2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Body Temp (°F)"
            placeholder="98.6"
            type="number"
            step="0.1"
            icon={Thermometer}
            value={vitals.temperature_f}
            onChange={(e) => handleChange('temperature_f', e.target.value)}
          />
          <Input
            label="SpO2 (% Oxygen)"
            placeholder="99"
            type="number"
            icon={Wind}
            value={vitals.spo2_percent}
            onChange={(e) => handleChange('spo2_percent', e.target.value)}
          />
          <Input
            label="Blood Sugar (mg/dL)"
            placeholder="110"
            type="number"
            value={vitals.random_blood_sugar_mg_dl}
            onChange={(e) => handleChange('random_blood_sugar_mg_dl', e.target.value)}
          />
        </div>

        {/* Height, Weight & BMI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Weight (kg)"
            placeholder="70"
            type="number"
            step="0.1"
            icon={Weight}
            value={vitals.weight_kg}
            onChange={(e) => handleChange('weight_kg', e.target.value)}
          />
          <Input
            label="Height (cm)"
            placeholder="175"
            type="number"
            step="0.5"
            icon={Ruler}
            value={vitals.height_cm}
            onChange={(e) => handleChange('height_cm', e.target.value)}
          />
          <Input
            label="Head Circumference (cm)"
            placeholder="Pediatric only"
            type="number"
            step="0.1"
            value={vitals.head_circumference_cm}
            onChange={(e) => handleChange('head_circumference_cm', e.target.value)}
          />
        </div>

        {/* Dynamic BMI Calculation Card */}
        {bmi && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-700">
                Calculated BMI:{' '}
                <strong className="text-slate-900 text-sm font-bold">{bmi} kg/m²</strong>
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                bmiCategory.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-800'
                  : bmiCategory.color === 'amber'
                  ? 'bg-amber-100 text-amber-800'
                  : bmiCategory.color === 'rose'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {bmiCategory.label}
            </span>
          </div>
        )}

        <Input
          label="Triage / Nurse Clinical Notes"
          placeholder="e.g. Patient feels dizziness since morning, no chest pain"
          value={vitals.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Activity}>
            Save Patient Vitals
          </Button>
        </div>
      </form>
    </Modal>
  );
};
