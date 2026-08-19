import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Calendar, Plus, ExternalLink, Clock, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { formatDate } from '../../utils/formatters';

export const TeleconsultationList = () => {
  const navigate = useNavigate();
  const { user, activeClinic } = useAuth();
  const { showToast } = useToast();

  const [meetings, setMeetings] = useState([
    {
      _id: '1',
      meeting_id: 'meet-docpa-8472',
      patient_name: 'Anita Verma',
      patient_phone: '9876501234',
      scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      call_type: 'video',
      status: 'scheduled',
    },
    {
      _id: '2',
      meeting_id: 'meet-docpa-9102',
      patient_name: 'Rajesh Khanna',
      patient_phone: '9812345678',
      scheduled_at: new Date(Date.now() + 7200000).toISOString(),
      call_type: 'video',
      status: 'scheduled',
    },
  ]);

  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    patient_name: '',
    patient_phone: '',
    call_type: 'video',
  });

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newMeetingForm.patient_name || !newMeetingForm.patient_phone) {
      showToast('Patient name and phone are required', 'warning');
      return;
    }

    const meetingId = `meet-docpa-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMeet = {
      _id: String(Date.now()),
      meeting_id: meetingId,
      patient_name: newMeetingForm.patient_name,
      patient_phone: newMeetingForm.patient_phone,
      scheduled_at: new Date().toISOString(),
      call_type: newMeetingForm.call_type,
      status: 'scheduled',
    };

    setMeetings([newMeet, ...meetings]);
    showToast(`Video consultation room created! Meeting ID: ${meetingId}`);
    setIsNewMeetingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Video className="w-6 h-6 text-teal-600" />
            Teleconsultation Video Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct HD encrypted WebRTC teleconsultations with live prescription writing pad
          </p>
        </div>

        <Button
          size="sm"
          icon={Plus}
          onClick={() => setIsNewMeetingModalOpen(true)}
          className="shadow-sm"
        >
          Create Video Consultation
        </Button>
      </div>

      {/* Video Sessions List */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-900">
            Scheduled Teleconsultation Rooms ({meetings.length})
          </h3>
        </CardHeader>

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Meeting ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Call Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meetings.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {m.meeting_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.patient_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{m.patient_phone}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">
                      {m.call_type} HD
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold">
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/teleconsultation/room/${m.meeting_id}`;
                            navigator.clipboard.writeText(link);
                            showToast('Patient join link copied to clipboard!');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                        >
                          Copy Link
                        </button>
                        <Link
                          to={`/teleconsultation/room/${m.meeting_id}`}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Video Room
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* New Meeting Modal */}
      {isNewMeetingModalOpen && (
        <Modal
          isOpen={isNewMeetingModalOpen}
          onClose={() => setIsNewMeetingModalOpen(false)}
          title="Schedule Video Teleconsultation"
          subtitle="Generate secure meeting link for patient"
        >
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <Input
              label="Patient Full Name"
              placeholder="e.g. Suman Rao"
              value={newMeetingForm.patient_name}
              onChange={(e) =>
                setNewMeetingForm({ ...newMeetingForm, patient_name: e.target.value })
              }
              required
              autoFocus
            />

            <Input
              label="Patient Mobile Number"
              placeholder="9876543210"
              icon={Phone}
              value={newMeetingForm.patient_phone}
              onChange={(e) =>
                setNewMeetingForm({ ...newMeetingForm, patient_phone: e.target.value })
              }
              required
            />

            <Select
              label="Call Type"
              value={newMeetingForm.call_type}
              onChange={(e) =>
                setNewMeetingForm({ ...newMeetingForm, call_type: e.target.value })
              }
              options={[
                { value: 'video', label: 'Encrypted HD Video Consultation' },
                { value: 'audio', label: 'Audio Consultation' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsNewMeetingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" icon={Video}>
                Create Telehealth Room
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
