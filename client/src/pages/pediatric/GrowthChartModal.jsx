import React, { useState } from 'react';
import { Baby, Activity, Weight, Ruler, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const GrowthChartModal = ({ isOpen, onClose, patient, onGrowthRecorded }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    age_in_months: patient?.age_years ? patient.age_years * 12 : 12,
    weight_kg: '',
    height_cm: '',
    head_circumference_cm: '',
    developmental_milestones: '',
    nutritional_status: 'Normal',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) {
      showToast('Patient record is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        age_in_months: Number(formData.age_in_months),
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
        height_cm: formData.height_cm ? Number(formData.height_cm) : undefined,
        head_circumference_cm: formData.head_circumference_cm
          ? Number(formData.head_circumference_cm)
          : undefined,
        developmental_milestones: formData.developmental_milestones
          ? formData.developmental_milestones.split(',').map((s) => s.trim())
          : [],
        nutritional_status: formData.nutritional_status,
        notes: formData.notes,
      };

      await api.post(`/v1/growth/patient/${patient._id}`, payload);
      showToast('Child growth metric recorded & percentile computed!');
      if (onGrowthRecorded) {
        onGrowthRecorded();
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to record growth metric', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Pediatric Growth Metric (WHO Standards)"
      subtitle={`Child: ${patient?.name} • Age: ${formData.age_in_months} Months`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Age (in Months)"
            type="number"
            value={formData.age_in_months}
            onChange={(e) => setFormData({ ...formData, age_in_months: e.target.value })}
            required
          />
          <Select
            label="Nutritional Status"
            value={formData.nutritional_status}
            onChange={(e) => setFormData({ ...formData, nutritional_status: e.target.value })}
            options={[
              { value: 'Normal', label: 'Normal Growth' },
              { value: 'Mild Underweight', label: 'Mild Underweight' },
              { value: 'Moderate Underweight', label: 'Moderate Underweight' },
              { value: 'Severe Underweight', label: 'Severe Underweight' },
              { value: 'Overweight', label: 'Overweight' },
              { value: 'Obese', label: 'Obese' },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.05"
            placeholder="10.2"
            icon={Weight}
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
          />
          <Input
            label="Height / Length (cm)"
            type="number"
            step="0.5"
            placeholder="78"
            icon={Ruler}
            value={formData.height_cm}
            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
          />
          <Input
            label="Head Circ. (cm)"
            type="number"
            step="0.1"
            placeholder="46.5"
            value={formData.head_circumference_cm}
            onChange={(e) =>
              setFormData({ ...formData, head_circumference_cm: e.target.value })
            }
          />
        </div>

        <Input
          label="Developmental Milestones Achieved"
          placeholder="e.g. Walking independently, 5-word vocabulary, Pincer grasp"
          value={formData.developmental_milestones}
          onChange={(e) =>
            setFormData({ ...formData, developmental_milestones: e.target.value })
          }
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={CheckCircle2}>
            Save Growth Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
