import React, { useState, useEffect } from 'react';
import {
  Baby,
  Activity,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  Clock,
  Weight,
  Ruler,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { GrowthChartModal } from './GrowthChartModal';
import { formatDate } from '../../utils/formatters';

export const PediatricDashboard = () => {
  const { activeClinic } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Vaccine Schedule & Growth history
  const [vaccineSchedule, setVaccineSchedule] = useState([]);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Modals
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [isMarkGivenModalOpen, setIsMarkGivenModalOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [givenForm, setGivenForm] = useState({
    brand_name: 'Hexaxim',
    batch_number: 'BATCH-4829',
    given_date: new Date().toISOString().split('T')[0],
  });

  const handleSearchChild = async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/v1/patients/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data?.patients || []);
    } catch (err) {
      console.warn('Search child error:', err);
    }
  };

  const loadChildData = async (child) => {
    setSelectedChild(child);
    setSearchResults([]);
    setSearchQuery('');
    setLoadingSchedule(true);

    try {
      // 1. Fetch vaccines
      const vacRes = await api.get(`/v1/vaccines/patient/${child._id}`);
      setVaccineSchedule(vacRes.data?.schedule || []);

      // 2. Fetch growth
      const growthRes = await api.get(`/v1/growth/patient/${child._id}`);
      setGrowthHistory(growthRes.data?.history || []);
    } catch (err) {
      console.warn('Child data fetch error:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleMarkGivenSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;

    try {
      await api.patch(`/v1/vaccines/${selectedVaccine._id}/given`, givenForm);
      showToast(`Vaccine ${selectedVaccine.vaccine_name} marked as Given!`);
      setIsMarkGivenModalOpen(false);
      loadChildData(selectedChild);
    } catch (err) {
      showToast(err.message || 'Failed to update vaccine status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Baby className="w-6 h-6 text-teal-600" />
            Pediatric & Immunization Engine (IAP Standard)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete Indian Academy of Pediatrics (IAP) vaccine chart tracking and WHO child growth
            percentiles
          </p>
        </div>

        {selectedChild && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Activity}
              onClick={() => setIsGrowthModalOpen(true)}
            >
              + Record Growth Metric
            </Button>
          </div>
        )}
      </div>

      {/* Child Selector Search Bar */}
      <Card className="p-4 bg-gradient-to-br from-teal-50/40 to-white border-teal-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search child patient by name / phone / UHID..."
              value={searchQuery}
              onChange={(e) => handleSearchChild(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((child) => (
                  <button
                    key={child._id}
                    type="button"
                    onClick={() => loadChildData(child)}
                    className="w-full text-left p-3 hover:bg-teal-50 transition text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{child.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {child.age_years} Y ({child.age_years * 12} Months) • UHID: {child.uhid}
                      </p>
                    </div>
                    <span className="text-teal-700 font-bold px-2 py-1 bg-teal-50 rounded-lg">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedChild ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedChild.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedChild.age_years} Y • Guardian: {selectedChild.guardian_name || 'Parent'}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Select a child above to view immunization schedule & growth percentiles
            </span>
          )}
        </div>
      </Card>

      {/* Main Pediatric Stage */}
      {selectedChild && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: IAP Vaccine Matrix */}
          <div className="lg:col-span-8 space-y-4">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    IAP Immunization Schedule ({vaccineSchedule.length} Vaccines)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Indian Academy of Pediatrics standard schedule from Birth to 12 Years
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Given: {vaccineSchedule.filter((v) => v.status === 'given').length}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    Due: {vaccineSchedule.filter((v) => v.status === 'due' || v.status === 'upcoming').length}
                  </span>
                </div>
              </CardHeader>

              <CardBody className="p-0">
                {loadingSchedule ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Loading child immunization schedule...
                  </div>
                ) : vaccineSchedule.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No active vaccination schedule found for this child.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">Milestone</th>
                          <th className="py-3 px-4">Vaccine & Protection</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Status & Brand</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vaccineSchedule.map((vac) => (
                          <tr key={vac._id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {vac.age_milestone}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-teal-800 block">
                                {vac.vaccine_name} ({vac.dose_number || 'Dose 1'})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {vac.disease_covered}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {formatDate(vac.due_date)}
                            </td>
                            <td className="py-3 px-4">
                              {vac.status === 'given' ? (
                                <div>
                                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                                    ✓ Given on {formatDate(vac.given_date)}
                                  </span>
                                  {vac.brand_name && (
                                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                                      Brand: {vac.brand_name} ({vac.batch_number || '-'})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                                  Upcoming / Due
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {vac.status !== 'given' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVaccine(vac);
                                    setIsMarkGivenModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
                                >
                                  Mark Given
                                </button>
                              ) : (
                                <span className="text-slate-400 font-semibold text-[11px]">
                                  Administered
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* RIGHT: WHO Growth History */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Growth Tracking (WHO)
                </span>
                <button
                  type="button"
                  onClick={() => setIsGrowthModalOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  + Log Metric
                </button>
              </div>

              {growthHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No growth logs recorded yet. Click "+ Log Metric" to record weight, height, and
                  head circumference.
                </div>
              ) : (
                <div className="space-y-3">
                  {growthHistory.map((g) => (
                    <div
                      key={g._id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Age: {g.age_in_months} Months</span>
                        <span className="text-teal-700">{formatDate(g.recorded_date || g.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                        <span>Wt: <strong>{g.weight_kg} kg</strong></span>
                        <span>Ht: <strong>{g.height_cm} cm</strong></span>
                        <span>BMI: <strong>{g.bmi || '-'}</strong></span>
                      </div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Status: {g.nutritional_status || 'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Mark Vaccine Given Modal */}
      {isMarkGivenModalOpen && selectedVaccine && (
        <Modal
          isOpen={isMarkGivenModalOpen}
          onClose={() => setIsMarkGivenModalOpen(false)}
          title={`Administer Vaccine: ${selectedVaccine.vaccine_name}`}
          subtitle={`Child: ${selectedChild?.name} • Milestone: ${selectedVaccine.age_milestone}`}
        >
          <form onSubmit={handleMarkGivenSubmit} className="space-y-4">
            <Input
              label="Vaccine Brand Administered"
              placeholder="e.g. Hexaxim, Rotavac, Prevenar 13, Priorix"
              value={givenForm.brand_name}
              onChange={(e) => setGivenForm({ ...givenForm, brand_name: e.target.value })}
              required
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Batch / Lot Number"
                placeholder="BATCH-98124"
                value={givenForm.batch_number}
                onChange={(e) => setGivenForm({ ...givenForm, batch_number: e.target.value })}
              />
              <Input
                label="Administration Date"
                type="date"
                value={givenForm.given_date}
                onChange={(e) => setGivenForm({ ...givenForm, given_date: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsMarkGivenModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" icon={CheckCircle2}>
                Confirm Vaccine Given
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Growth Metric Modal */}
      {isGrowthModalOpen && selectedChild && (
        <GrowthChartModal
          isOpen={isGrowthModalOpen}
          onClose={() => setIsGrowthModalOpen(false)}
          patient={selectedChild}
          onGrowthRecorded={() => {
            loadChildData(selectedChild);
          }}
        />
      )}
    </div>
  );
};
