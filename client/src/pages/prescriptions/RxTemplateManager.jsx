import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, Edit2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { DOSAGE_FREQUENCIES, DOSAGE_FORMS, TIMINGS } from '../../utils/formatters';

export const RxTemplateManager = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for new/edit template
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chief_complaints: [],
    diagnosis: [],
    medicines: [],
    investigations: [],
    general_advice: 'Take medications on time. Drink plenty of warm water.',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/templates');
      setTemplates(res.data?.templates || []);
    } catch (err) {
      console.warn('Templates fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenNew = () => {
    setEditingTemplateId(null);
    setFormData({
      name: '',
      description: '',
      chief_complaints: ['Fever', 'Body Pain'],
      diagnosis: ['Viral Fever'],
      medicines: [
        {
          name: 'Paracetamol 650mg',
          generic_name: 'Paracetamol',
          dosage_form: 'Tablet',
          dose: '1 Tab',
          frequency: '1-0-1',
          timing: 'After Food',
          duration_days: 3,
          instructions: '',
        },
      ],
      investigations: [],
      general_advice: 'Drink warm water and rest well.',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Template name is required', 'warning');
      return;
    }

    try {
      if (editingTemplateId) {
        await api.put(`/v1/templates/${editingTemplateId}`, formData);
        showToast('Template updated successfully!');
      } else {
        await api.post('/v1/templates', formData);
        showToast('New Rx Template created successfully!');
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      showToast(err.message || 'Failed to save template', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/v1/templates/${id}`);
      showToast('Template deleted');
      fetchTemplates();
    } catch (err) {
      showToast(err.message || 'Failed to delete template', 'error');
    }
  };

  const handleAddMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          name: '',
          dosage_form: 'Tablet',
          dose: '1 Tab',
          frequency: '1-0-1',
          timing: 'After Food',
          duration_days: 5,
          instructions: '',
        },
      ],
    }));
  };

  const handleUpdateMedicine = (idx, field, val) => {
    const list = [...formData.medicines];
    list[idx][field] = val;
    setFormData((prev) => ({ ...prev, medicines: list }));
  };

  const handleRemoveMedicine = (idx) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-teal-600" />
            Prescription Templates (1-Click Rx Kits)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configure common disease treatment kits (Viral, Hypertension, Pediatric Cold) for
            10-second consultations
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenNew} size="sm">
          Create Rx Template
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Sparkles className="w-12 h-12 text-teal-500/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Rx Templates Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Create favorite prescription kits (e.g. Viral Fever Starter, Gastritis Kit, URTI Combo) to
            generate complete prescriptions in 1-click.
          </p>
          <Button icon={Plus} onClick={handleOpenNew} size="sm" className="mt-4">
            Create Your First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tmpl) => (
            <Card key={tmpl._id} className="p-5 hover:shadow-premium transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                      Rx
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">{tmpl.name}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(tmpl._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {tmpl.diagnosis?.length > 0 && (
                  <p className="text-xs text-teal-800 font-semibold bg-teal-50/80 px-2 py-1 rounded-lg inline-block mb-3">
                    Diagnosis: {tmpl.diagnosis.join(', ')}
                  </p>
                )}

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Medications ({tmpl.medicines?.length || 0})
                  </span>
                  {tmpl.medicines?.map((m, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between text-slate-700">
                      <span className="font-semibold truncate max-w-[180px]">
                        {idx + 1}. {m.name}
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {m.frequency} • {m.duration_days}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{tmpl.investigations?.length || 0} Lab tests included</span>
                <span className="text-teal-600 font-bold">1-Click Ready</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Template */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTemplateId ? 'Edit Rx Template' : 'Create 1-Click Rx Template'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Template Name"
              placeholder="e.g. Viral Fever Starter Kit, Acute URTI, Pediatric Cough"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Medications ({formData.medicines.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {formData.medicines.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Drug name (e.g. Augmentin 625mg)"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                        required
                      />
                      <select
                        value={med.dosage_form}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage_form', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
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
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                      >
                        {DOSAGE_FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.value}
                          </option>
                        ))}
                      </select>
                      <select
                        value={med.timing}
                        onChange={(e) => handleUpdateMedicine(idx, 'timing', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        {TIMINGS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={med.duration_days}
                          onChange={(e) =>
                            handleUpdateMedicine(idx, 'duration_days', Number(e.target.value))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-slate-200 bg-white text-center font-bold"
                        />
                        <span className="text-[10px] text-slate-400">Days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" icon={Bookmark}>
                Save Template
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
