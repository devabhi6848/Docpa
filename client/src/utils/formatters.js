/**
 * Docpa Utility Formatters & Health Helpers
 */

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (!bmi) return { label: 'Unknown', color: 'gray' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 24.9) return { label: 'Normal Weight', color: 'emerald' };
  if (bmi < 29.9) return { label: 'Overweight', color: 'amber' };
  return { label: 'Obese', color: 'rose' };
};

export const getVitalsAlert = (type, value) => {
  if (!value) return null;
  switch (type) {
    case 'bp_systolic':
      if (value > 140) return { level: 'high', label: 'High BP (Systolic)' };
      if (value < 90) return { level: 'low', label: 'Low BP (Systolic)' };
      break;
    case 'bp_diastolic':
      if (value > 90) return { level: 'high', label: 'High BP (Diastolic)' };
      if (value < 60) return { level: 'low', label: 'Low BP (Diastolic)' };
      break;
    case 'pulse_rate':
      if (value > 100) return { level: 'high', label: 'Tachycardia' };
      if (value < 60) return { level: 'low', label: 'Bradycardia' };
      break;
    case 'spo2_percent':
      if (value < 94) return { level: 'critical', label: 'Low Oxygen Saturation (<94%)' };
      break;
    case 'temperature_f':
      if (value > 99.5) return { level: 'high', label: 'Fever' };
      if (value > 102) return { level: 'critical', label: 'High Fever' };
      break;
    default:
      return null;
  }
  return null;
};

export const DOSAGE_FREQUENCIES = [
  { value: '1-0-1', label: '1-0-1 (Morning & Night)', times: 2 },
  { value: '1-0-0', label: '1-0-0 (Morning only)', times: 1 },
  { value: '0-0-1', label: '0-0-1 (Night only)', times: 1 },
  { value: '1-1-1', label: '1-1-1 (TDS - Thrice daily)', times: 3 },
  { value: '1-1-0', label: '1-1-0 (Morning & Noon)', times: 2 },
  { value: '0-1-1', label: '0-1-1 (Noon & Night)', times: 2 },
  { value: 'SOS', label: 'SOS (As needed when pain/fever)', times: 0 },
  { value: 'Stat', label: 'STAT (Immediate single dose)', times: 1 },
  { value: '1-0-1-0', label: 'Four times daily (QID)', times: 4 },
];

export const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Drops',
  'Injection',
  'Ointment',
  'Cream',
  'Inhaler',
  'Spray',
  'Gel',
  'Powder',
];

export const TIMINGS = [
  'After Food',
  'Before Food',
  'With Food',
  'Empty Stomach',
  'At Bedtime',
  'Anytime',
];
