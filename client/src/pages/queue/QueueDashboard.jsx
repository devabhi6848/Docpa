import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  UserPlus,
  Activity,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Tv,
  RefreshCw,
  Sparkles,
  Phone,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { GenerateTokenModal } from './GenerateTokenModal';
import { VitalsRecordModal } from './VitalsRecordModal';
import { formatTime, formatDateTime } from '../../utils/formatters';

export const QueueDashboard = () => {
  const { activeClinic, isDoctor } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null);

  // Fetch today's queue
  const fetchQueue = useCallback(async () => {
    if (!activeClinic) return;
    setLoading(true);
    try {
      const res = await api.get('/v1/queue/today');
      setQueue(res.data?.queue || []);
    } catch (err) {
      console.error('Failed to fetch OPD queue:', err);
    } finally {
      setLoading(false);
    }
  }, [activeClinic]);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Update token status
  const handleUpdateStatus = async (tokenId, newStatus) => {
    try {
      await api.patch(`/v1/queue/${tokenId}/status`, { status: newStatus });
      showToast(`Token status updated to ${newStatus.replace('_', ' ')}`);
      fetchQueue();
    } catch (err) {
      showToast(err.message || 'Failed to update token status', 'error');
    }
  };

  // Start Consultation -> Redirect to Prescription Studio
  const handleStartConsultation = (appointment) => {
    handleUpdateStatus(appointment._id, 'with_doctor');
    navigate('/prescriptions/new', {
      state: {
        appointmentId: appointment._id,
        patientId: appointment.patient_id?._id || appointment.patient_id,
        patientData: appointment.patient_id,
        vitalsData: appointment.vitals_id,
        chiefComplaint: appointment.chief_complaint,
      },
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="amber" dot>Waiting</Badge>;
      case 'with_doctor':
        return <Badge variant="indigo" dot>With Doctor</Badge>;
      case 'completed':
        return <Badge variant="emerald">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="slate">No-Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filtered Queue
  const filteredQueue = queue.filter((item) => {
    const matchesStatus =
      filterStatus === 'all' || item.status === filterStatus;
    const patientName = item.patient_id?.name?.toLowerCase() || '';
    const phone = item.patient_id?.phone || '';
    const tokenNum = String(item.token_number || '');
    const matchesSearch =
      patientName.includes(searchFilter.toLowerCase()) ||
      phone.includes(searchFilter) ||
      tokenNum.includes(searchFilter);

    return matchesStatus && matchesSearch;
  });

  // Statistics counters
  const waitingCount = queue.filter((q) => q.status === 'waiting').length;
  const withDoctorCount = queue.filter((q) => q.status === 'with_doctor').length;
  const completedCount = queue.filter((q) => q.status === 'completed').length;
  const totalCount = queue.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-teal-600" />
            Live OPD Queue & Front-Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time patient check-ins, token calling, vitals triage, and consultation status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchQueue}
            loading={loading}
            title="Refresh Queue"
            size="sm"
          >
            Refresh
          </Button>

          {activeClinic && (
            <Link
              to={`/tv-display/${activeClinic._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <Tv className="w-4 h-4 text-teal-400" />
              <span>TV Display Mode</span>
            </Link>
          )}

          <Button
            icon={UserPlus}
            onClick={() => setIsTokenModalOpen(true)}
            size="sm"
            className="shadow-sm"
          >
            Generate OPD Token
          </Button>
        </div>
      </div>

      {/* OPD Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Waiting in OPD
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-amber-900 mt-2">{waitingCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">Patients in line</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              With Doctor
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-900 mt-2">{withDoctorCount}</p>
          <span className="text-[11px] text-indigo-700 font-medium">In consultation room</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Completed Today
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-900 mt-2">{completedCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Prescriptions issued</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Total Check-ins
            </span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">All visits registered</span>
        </Card>
      </div>

      {/* Queue Filters & Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'waiting', label: `Waiting (${waitingCount})` },
              { id: 'with_doctor', label: `In Cabin (${withDoctorCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token / patient..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              Loading live queue...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No patients in this queue view</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "+ Generate OPD Token" above to check-in walk-in or booked patients.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Patient Information</th>
                    <th className="py-3 px-4">Visit Type / Priority</th>
                    <th className="py-3 px-4">Vitals Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => {
                    const patient = item.patient_id || {};
                    const vitals = item.vitals_id;
                    const isUrgent = item.priority === 'urgent' || item.priority === 'emergency';

                    return (
                      <tr
                        key={item._id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isUrgent ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        {/* Token Number */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 text-white font-extrabold text-sm shadow-xs">
                            {item.token_number}
                          </div>
                        </td>

                        {/* Patient Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            <Link
                              to={`/patients/${patient._id}`}
                              className="hover:text-teal-600 hover:underline"
                            >
                              {patient.name || 'Walk-in Patient'}
                            </Link>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{patient.phone || '-'}</span>
                            <span>•</span>
                            <span>{patient.age_years || '-'} Y / {patient.gender || '-'}</span>
                            {patient.uhid && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-400">{patient.uhid}</span>
                              </>
                            )}
                          </div>
                          {item.chief_complaint && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1 font-medium">
                              {item.chief_complaint}
                            </p>
                          )}
                        </td>

                        {/* Visit Type & Priority */}
                        <td className="py-3.5 px-4">
                          <span className="capitalize font-semibold text-slate-700 block">
                            {item.visit_type ? item.visit_type.replace('_', ' ') : 'New Visit'}
                          </span>
                          {isUrgent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              {item.priority.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Normal</span>
                          )}
                        </td>

                        {/* Vitals Snapshot */}
                        <td className="py-3.5 px-4">
                          {vitals ? (
                            <div className="text-[11px] space-y-0.5">
                              <div className="font-semibold text-slate-800">
                                BP: {vitals.bp_systolic || '-'}/{vitals.bp_diastolic || '-'} • P:{' '}
                                {vitals.pulse_rate || '-'}
                              </div>
                              <div className="text-slate-500">
                                Wt: {vitals.weight_kg ? `${vitals.weight_kg}kg` : '-'} • SpO2:{' '}
                                {vitals.spo2_percent ? `${vitals.spo2_percent}%` : '-'}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatientForVitals(patient);
                                setIsVitalsModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold text-[11px] transition"
                            >
                              <Activity className="w-3 h-3" />
                              + Record Vitals
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'waiting' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartConsultation(item)}
                                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                                  title="Start Doctor Consultation"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  Consult
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item._id, 'no_show')}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                  title="Mark as No-Show"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {item.status === 'with_doctor' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartConsultation(item)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Write Rx
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item._id, 'completed')}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                                  title="Mark Completed"
                                >
                                  Done
                                </button>
                              </>
                            )}

                            {item.status === 'completed' && (
                              <Link
                                to={`/prescriptions/new`}
                                state={{ patientId: patient._id }}
                                className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-xs"
                              >
                                View Rx
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Generate Token Modal */}
      {isTokenModalOpen && (
        <GenerateTokenModal
          isOpen={isTokenModalOpen}
          onClose={() => setIsTokenModalOpen(false)}
          onTokenCreated={() => {
            fetchQueue();
          }}
        />
      )}

      {/* Record Vitals Modal */}
      {isVitalsModalOpen && selectedPatientForVitals && (
        <VitalsRecordModal
          isOpen={isVitalsModalOpen}
          onClose={() => {
            setIsVitalsModalOpen(false);
            setSelectedPatientForVitals(null);
          }}
          patient={selectedPatientForVitals}
          onVitalsRecorded={() => {
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};
