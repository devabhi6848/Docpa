import React, { useState } from 'react';
import { UserPlus, Heart, AlertCircle, MapPin, Phone } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const RegisterPatientModal = ({ isOpen, onClose, onPatientCreated }) => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    age_years: '',
    age_months: '0',
    blood_group: 'unknown',
    guardian_name: '',
    guardian_relationship: 'Self',
    allergies: '',
    chronic_conditions: '',
    confidential_notes: '',
    address_street: '',
    address_city: '',
    address_pincode: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeClinic) {
      showToast('Please select an active clinic first', 'warning');
      return;
    }
    if (!formData.name || !formData.phone) {
      showToast('Patient name and phone number are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clinic_id: activeClinic._id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        age_years: Number(formData.age_years) || 0,
        age_months: Number(formData.age_months) || 0,
        blood_group: formData.blood_group,
        guardian_name: formData.guardian_name,
        guardian_relationship: formData.guardian_relationship,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronic_conditions: formData.chronic_conditions
          ? formData.chronic_conditions.split(',').map((s) => s.trim())
          : [],
        confidential_notes: formData.confidential_notes,
        address: {
          street: formData.address_street,
          city: formData.address_city,
          pincode: formData.address_pincode,
        },
      };

      const res = await api.post('/v1/patients', payload);
      showToast(`Patient registered! UHID: ${res.data?.patient?.uhid}`);
      if (onPatientCreated) {
        onPatientCreated(res.data?.patient);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to register patient', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Patient Record"
      subtitle="Create longitudinal health record with demographics, allergies, and emergency info"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            placeholder="Ramesh Kumar"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Mobile Number (Primary)"
            placeholder="9876543210"
            icon={Phone}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>

        {/* Age, Gender & Blood Group */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Age (Years)"
            type="number"
            placeholder="35"
            value={formData.age_years}
            onChange={(e) => handleChange('age_years', e.target.value)}
          />
          <Input
            label="Age (Months)"
            type="number"
            placeholder="0"
            value={formData.age_months}
            onChange={(e) => handleChange('age_months', e.target.value)}
          />
          <Select
            label="Blood Group"
            value={formData.blood_group}
            onChange={(e) => handleChange('blood_group', e.target.value)}
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

        {/* Guardian & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Guardian / Father / Spouse Name"
            placeholder="Mr. Suresh Kumar"
            value={formData.guardian_name}
            onChange={(e) => handleChange('guardian_name', e.target.value)}
          />
          <Select
            label="Guardian Relationship"
            value={formData.guardian_relationship}
            onChange={(e) => handleChange('guardian_relationship', e.target.value)}
            options={[
              { value: 'Self', label: 'Self' },
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Guardian', label: 'Guardian' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        {/* Medical History & Allergies */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Clinical History & Known Risk Factors
          </p>

          <Input
            label="Known Drug / Food Allergies (Comma separated)"
            placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
            value={formData.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
          />

          <Input
            label="Chronic Conditions (Comma separated)"
            placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma, Thyroid"
            value={formData.chronic_conditions}
            onChange={(e) => handleChange('chronic_conditions', e.target.value)}
          />
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Street Address"
            placeholder="Flat 102, Green Avenue"
            value={formData.address_street}
            onChange={(e) => handleChange('address_street', e.target.value)}
          />
          <Input
            label="City"
            placeholder="Mumbai / Delhi"
            value={formData.address_city}
            onChange={(e) => handleChange('address_city', e.target.value)}
          />
          <Input
            label="Pincode"
            placeholder="400001"
            value={formData.address_pincode}
            onChange={(e) => handleChange('address_pincode', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={UserPlus}>
            Save & Register Patient
          </Button>
        </div>
      </form>
    </Modal>
  );
};
