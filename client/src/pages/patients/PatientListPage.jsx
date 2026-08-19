import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  FileText,
  Activity,
  Calendar,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RegisterPatientModal } from './RegisterPatientModal';
import { formatDate } from '../../utils/formatters';

export const PatientListPage = () => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchPatients = useCallback(
    async (query = '') => {
      setLoading(true);
      try {
        const res = await api.get(`/v1/patients/search?q=${encodeURIComponent(query)}`);
        setPatients(res.data?.patients || []);
      } catch (err) {
        console.warn('Fetch patients error:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeClinic]
  );

  useEffect(() => {
    fetchPatients('');
  }, [fetchPatients]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length === 0 || val.length >= 2) {
      fetchPatients(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-600" />
            Patient Directory & Medical Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search patient longitudinal EHR, past prescriptions, vitals charts, and vaccination status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchPatients(searchQuery)}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            icon={UserPlus}
            onClick={() => setIsRegisterModalOpen(true)}
            className="shadow-sm"
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* Search and Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Mobile, Name, or UHID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{patients.length}</strong> patient records
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              Searching directory...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No patients found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try a different search query or register a new patient.
              </p>
              <Button
                icon={UserPlus}
                size="sm"
                onClick={() => setIsRegisterModalOpen(true)}
                className="mt-4"
              >
                Register Patient Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Patient Name & UHID</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Demographics</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Allergies & Risk</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/patients/${p._id}`}
                          className="font-bold text-slate-900 text-sm hover:text-teal-600 hover:underline block"
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-[10px] text-teal-800 font-semibold">
                          {p.uhid || 'UHID-PENDING'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {p.phone}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {p.age_years ? `${p.age_years} Y` : '-'} /{' '}
                        <span className="capitalize">{p.gender}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.blood_group && p.blood_group !== 'unknown' ? (
                          <span className="font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            {p.blood_group}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.allergies?.length > 0 ? (
                          <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                            {p.allergies.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">None reported</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(p.last_visit_date || p.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/prescriptions/new`}
                            state={{ patientId: p._id }}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition inline-flex items-center gap-1"
                            title="New Consultation"
                          >
                            <Sparkles className="w-3 h-3" />
                            Consult
                          </Link>

                          <Link
                            to={`/patients/${p._id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Register Patient Modal */}
      {isRegisterModalOpen && (
        <RegisterPatientModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onPatientCreated={() => {
            fetchPatients(searchQuery);
          }}
        />
      )}
    </div>
  );
};
