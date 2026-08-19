import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Lock,
  Mail,
  Phone,
  User,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor', // 'doctor' | 'clinic_admin' | 'receptionist' | 'nurse'
    clinic_name: '',
    specialization: 'General Physician',
    registration_number: '',
    consultation_fee: 500,
  });

  const [loading, setLoading] = useState(false);
  const { registerWithPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      showToast('Please fill in all mandatory fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await registerWithPassword(formData);
      showToast('Clinic and Doctor profile created successfully! Welcome to Docpa.');
      navigate('/queue');
    } catch (err) {
      showToast(err.message || 'Registration failed. Check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 border border-teal-300/30">
            <Stethoscope className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Create Docpa Clinical Account
        </h2>
        <p className="mt-1 text-center text-xs font-medium text-teal-300">
          Setup Your Multi-Speciality Clinic, EMR Prescriptions & OPD Queue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { role: 'doctor', label: 'Doctor (MD/MBBS)' },
                { role: 'clinic_admin', label: 'Clinic Admin' },
                { role: 'receptionist', label: 'Receptionist' },
                { role: 'nurse', label: 'Nurse / Care' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.role}
                  onClick={() => handleChange('role', item.role)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    formData.role === item.role
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium'
                  }`}
                >
                  <span className="block text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder={formData.role === 'doctor' ? 'Dr. Priya Sharma' : 'Staff Name'}
                icon={User}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />

              <Input
                label="Mobile Number"
                placeholder="9876543210"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="doctor@docpa.com"
                icon={Mail}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                icon={Lock}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>

            {/* Doctor/Clinic Specific Fields */}
            {(formData.role === 'doctor' || formData.role === 'clinic_admin') && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Clinic & Medical Practice Details
                </p>

                <Input
                  label="Clinic / Hospital Name"
                  placeholder="Docpa Multispeciality Clinic"
                  icon={Building2}
                  value={formData.clinic_name}
                  onChange={(e) => handleChange('clinic_name', e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Specialization"
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    options={[
                      { value: 'General Physician', label: 'General Physician / Internal Medicine' },
                      { value: 'Pediatrician', label: 'Pediatrician (Child Specialist)' },
                      { value: 'Gynecologist', label: 'Gynecologist & Obstetrician' },
                      { value: 'Cardiologist', label: 'Cardiologist' },
                      { value: 'Dermatologist', label: 'Dermatologist (Skin)' },
                      { value: 'Orthopedic', label: 'Orthopedic Surgeon' },
                      { value: 'ENT Specialist', label: 'ENT Specialist' },
                      { value: 'Dentist', label: 'Dentist' },
                    ]}
                  />

                  <Input
                    label="Medical Reg. Number"
                    placeholder="MCI-194829 / State Council"
                    value={formData.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 shadow-lg shadow-teal-600/20"
              size="lg"
              icon={CheckCircle2}
            >
              Complete Registration & Start Practice
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700 underline">
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
