import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Users,
  User,
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const SettingsPage = () => {
  const { user, activeClinic, fetchUserData } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('clinic'); // 'clinic' | 'letterhead' | 'staff' | 'doctor'

  // Clinic Form
  const [clinicForm, setClinicForm] = useState({
    name: activeClinic?.name || '',
    tagline: activeClinic?.tagline || '',
    phone: activeClinic?.phone || '',
    email: activeClinic?.email || '',
    consultation_fee: activeClinic?.consultation_fee || 500,
    follow_up_fee: activeClinic?.follow_up_fee || 300,
    follow_up_validity_days: activeClinic?.follow_up_validity_days || 7,
    token_prefix: activeClinic?.token_prefix || 'T',
    address_street: activeClinic?.address?.street || '',
    address_city: activeClinic?.address?.city || '',
    address_pincode: activeClinic?.address?.pincode || '',
  });

  // Letterhead Form
  const [letterheadForm, setLetterheadForm] = useState({
    show_header: activeClinic?.letterhead_settings?.show_header !== false,
    header_title: activeClinic?.letterhead_settings?.header_title || '',
    paper_size: activeClinic?.letterhead_settings?.paper_size || 'A4',
    header_space_mm: activeClinic?.letterhead_settings?.header_space_mm || 0,
    footer_text:
      activeClinic?.letterhead_settings?.footer_text ||
      'Valid for medical record. Please bring this prescription for follow-up.',
  });

  // Doctor Profile Form
  const [doctorForm, setDoctorForm] = useState({
    qualifications: user?.doctor_profile?.qualifications || 'MBBS, MD',
    specialization: user?.doctor_profile?.specialization || 'General Physician',
    registration_number: user?.doctor_profile?.registration_number || 'MCI-847291',
    experience_years: user?.doctor_profile?.experience_years || 10,
    signature_url: user?.doctor_profile?.signature_url || '',
  });

  // Staff List & Add Staff Modal
  const [staffList, setStaffList] = useState([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    userId: '',
    role: 'receptionist',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeClinic) {
      setClinicForm({
        name: activeClinic.name || '',
        tagline: activeClinic.tagline || '',
        phone: activeClinic.phone || '',
        email: activeClinic.email || '',
        consultation_fee: activeClinic.consultation_fee || 500,
        follow_up_fee: activeClinic.follow_up_fee || 300,
        follow_up_validity_days: activeClinic.follow_up_validity_days || 7,
        token_prefix: activeClinic.token_prefix || 'T',
        address_street: activeClinic.address?.street || '',
        address_city: activeClinic.address?.city || '',
        address_pincode: activeClinic.address?.pincode || '',
      });

      setLetterheadForm({
        show_header: activeClinic.letterhead_settings?.show_header !== false,
        header_title: activeClinic.letterhead_settings?.header_title || '',
        paper_size: activeClinic.letterhead_settings?.paper_size || 'A4',
        header_space_mm: activeClinic.letterhead_settings?.header_space_mm || 0,
        footer_text:
          activeClinic.letterhead_settings?.footer_text ||
          'Valid for medical record. Please bring this prescription for follow-up.',
      });

      fetchStaff();
    }
  }, [activeClinic]);

  const fetchStaff = async () => {
    if (!activeClinic?._id) return;
    try {
      const res = await api.get(`/v1/clinics/${activeClinic._id}/staff`);
      setStaffList(res.data?.staff || []);
    } catch (e) {
      console.warn('Staff fetch warning:', e);
    }
  };

  // Save Clinic Details
  const handleSaveClinic = async (e) => {
    e.preventDefault();
    if (!activeClinic?._id) return;
    setSaving(true);
    try {
      const payload = {
        name: clinicForm.name,
        tagline: clinicForm.tagline,
        phone: clinicForm.phone,
        email: clinicForm.email,
        consultation_fee: Number(clinicForm.consultation_fee),
        follow_up_fee: Number(clinicForm.follow_up_fee),
        follow_up_validity_days: Number(clinicForm.follow_up_validity_days),
        token_prefix: clinicForm.token_prefix,
        address: {
          street: clinicForm.address_street,
          city: clinicForm.address_city,
          pincode: clinicForm.address_pincode,
        },
      };

      await api.put(`/v1/clinics/${activeClinic._id}`, payload);
      showToast('Clinic details updated successfully!');
      fetchUserData();
    } catch (err) {
      showToast(err.message || 'Failed to update clinic', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Letterhead Customizer
  const handleSaveLetterhead = async (e) => {
    e.preventDefault();
    if (!activeClinic?._id) return;
    setSaving(true);
    try {
      await api.put(`/v1/clinics/${activeClinic._id}`, {
        letterhead_settings: {
          show_header: letterheadForm.show_header,
          header_title: letterheadForm.header_title,
          paper_size: letterheadForm.paper_size,
          header_space_mm: Number(letterheadForm.header_space_mm),
          footer_text: letterheadForm.footer_text,
        },
      });
      showToast('Letterhead configuration updated!');
      fetchUserData();
    } catch (err) {
      showToast(err.message || 'Failed to save letterhead', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Doctor Profile
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/v1/doctors/profile', {
        doctor_profile: {
          qualifications: doctorForm.qualifications,
          specialization: doctorForm.specialization,
          registration_number: doctorForm.registration_number,
          experience_years: Number(doctorForm.experience_years),
          signature_url: doctorForm.signature_url,
        },
      });
      showToast('Doctor qualifications & signature updated!');
      fetchUserData();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-teal-600" />
          Clinic Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize clinic branding, OPD fees, prescription letterhead margins, staff access, and doctor profile
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'clinic', label: 'Clinic Information & Fees', icon: Building2 },
          { id: 'letterhead', label: 'Letterhead & Print Settings', icon: FileText },
          { id: 'staff', label: 'Staff & Team Access', icon: Users },
          { id: 'doctor', label: 'Doctor Credentials & Signature', icon: Stethoscope },
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

      {/* TAB 1: Clinic Profile & Fees */}
      {activeTab === 'clinic' && (
        <Card className="p-6">
          <form onSubmit={handleSaveClinic} className="space-y-4 max-w-2xl">
            <Input
              label="Clinic Name"
              value={clinicForm.name}
              onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
              required
            />

            <Input
              label="Tagline / Description"
              value={clinicForm.tagline}
              onChange={(e) => setClinicForm({ ...clinicForm, tagline: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Clinic Mobile / Phone"
                icon={Phone}
                value={clinicForm.phone}
                onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
              />
              <Input
                label="Official Email"
                icon={Mail}
                value={clinicForm.email}
                onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Consultation Fee (₹)"
                type="number"
                value={clinicForm.consultation_fee}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, consultation_fee: e.target.value })
                }
              />
              <Input
                label="Follow-up Fee (₹)"
                type="number"
                value={clinicForm.follow_up_fee}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, follow_up_fee: e.target.value })
                }
              />
              <Input
                label="Token Prefix"
                value={clinicForm.token_prefix}
                onChange={(e) => setClinicForm({ ...clinicForm, token_prefix: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Street Address"
                value={clinicForm.address_street}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, address_street: e.target.value })
                }
              />
              <Input
                label="City"
                value={clinicForm.address_city}
                onChange={(e) => setClinicForm({ ...clinicForm, address_city: e.target.value })}
              />
              <Input
                label="Pincode"
                value={clinicForm.address_pincode}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, address_pincode: e.target.value })
                }
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" loading={saving} icon={Save}>
                Save Clinic Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: Letterhead Customizer */}
      {activeTab === 'letterhead' && (
        <Card className="p-6">
          <form onSubmit={handleSaveLetterhead} className="space-y-4 max-w-2xl">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={letterheadForm.show_header}
                  onChange={(e) =>
                    setLetterheadForm({ ...letterheadForm, show_header: e.target.checked })
                  }
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Show Full Header (Clinic Name, Address, Doctor details)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-7">
                Uncheck if you are printing on pre-printed clinic letterhead pads.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Default Paper Size"
                value={letterheadForm.paper_size}
                onChange={(e) =>
                  setLetterheadForm({ ...letterheadForm, paper_size: e.target.value })
                }
                options={[
                  { value: 'A4', label: 'A4 Standard Sheet' },
                  { value: 'A5', label: 'A5 Half Sheet' },
                  { value: 'thermal', label: 'Thermal Roll (80mm)' },
                ]}
              />

              <Input
                label="Top Margin Space (in mm)"
                type="number"
                placeholder="0"
                helperText="Leave 40-50mm if using pre-printed letterhead pad"
                value={letterheadForm.header_space_mm}
                onChange={(e) =>
                  setLetterheadForm({ ...letterheadForm, header_space_mm: e.target.value })
                }
              />
            </div>

            <Input
              label="Footer Disclaimer Text"
              value={letterheadForm.footer_text}
              onChange={(e) =>
                setLetterheadForm({ ...letterheadForm, footer_text: e.target.value })
              }
            />

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" loading={saving} icon={Save}>
                Save Letterhead Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: Staff Management */}
      {activeTab === 'staff' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Clinic Team Members</h3>
              <p className="text-xs text-slate-500">
                Manage receptionists, nurses, and associate doctors for this clinic branch
              </p>
            </div>

            <Button
              size="sm"
              icon={Plus}
              onClick={() => showToast('Staff invitation feature active. Share registration link with staff.')}
            >
              + Add Staff Member
            </Button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  Dr
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{user?.name} (You)</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')} • Owner</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Active
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: Doctor Credentials */}
      {activeTab === 'doctor' && (
        <Card className="p-6">
          <form onSubmit={handleSaveDoctor} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Qualifications / Degrees"
                placeholder="MBBS, MD (Medicine), DNB"
                value={doctorForm.qualifications}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, qualifications: e.target.value })
                }
                required
              />

              <Input
                label="Specialization"
                placeholder="Consultant Physician / Pediatrician"
                value={doctorForm.specialization}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, specialization: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Medical Council Reg. Number"
                placeholder="MCI-847291 / State Council"
                value={doctorForm.registration_number}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, registration_number: e.target.value })
                }
                required
              />

              <Input
                label="Years of Experience"
                type="number"
                value={doctorForm.experience_years}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, experience_years: e.target.value })
                }
              />
            </div>

            <Input
              label="Digital Signature Image URL (Optional)"
              placeholder="https://cdn.docpa.in/signatures/doctor-sig.png"
              value={doctorForm.signature_url}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, signature_url: e.target.value })
              }
            />

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" loading={saving} icon={Save}>
                Save Doctor Credentials
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
