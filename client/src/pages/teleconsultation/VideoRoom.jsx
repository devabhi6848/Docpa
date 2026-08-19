import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Sparkles,
  MessageSquare,
  FileText,
  User,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const VideoRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, isDoctor } = useAuth();
  const { showToast } = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Secure WebRTC session established. End-to-end encrypted.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const videoRef = useRef(null);

  // Initialize camera preview
  useEffect(() => {
    let stream = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((e) => {
        console.warn('Camera access error:', e);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { sender: user?.name || 'Doctor', text: chatInput.trim() }]);
    setChatInput('');
  };

  const handleEndCall = () => {
    showToast('Teleconsultation ended.');
    navigate('/teleconsultation');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Session Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              Teleconsultation Room #{meetingId}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ● LIVE
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Encrypted Clinical WebRTC Session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Meeting link copied!');
            }}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 transition"
          >
            Copy Patient Link
          </button>
        </div>
      </div>

      {/* Main Video & Clinical Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0">
        {/* Main Video Screen */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-slate-500">
                <VideoOff className="w-16 h-16 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-semibold">Camera is turned off</p>
              </div>
            )}
          </div>

          {/* Patient Sub-view / Avatar Badge */}
          <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Consulting: Patient Connected</span>
          </div>

          {/* Bottom Floating Video Controls */}
          <div className="relative z-10 p-4 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-center gap-3">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3.5 rounded-2xl font-bold transition ${
                isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-2xl font-bold transition ${
                isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCall}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-rose-600/30 transition"
            >
              <PhoneOff className="w-5 h-5" />
              End Consultation
            </button>
          </div>
        </div>

        {/* Right: Doctor Notes & Chat Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          {/* Doctor Rapid Consultation Pad */}
          <div className="flex-1 bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  Live Consultation Notes
                </span>
                {isDoctor && (
                  <button
                    onClick={() =>
                      navigate('/prescriptions/new', {
                        state: { chiefComplaint: doctorNotes },
                      })
                    }
                    className="text-[11px] font-bold text-teal-400 hover:underline"
                  >
                    Open Rx Studio →
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                placeholder="Type clinical observations, symptoms, and diagnosis notes during call..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            <Button
              size="sm"
              icon={Sparkles}
              onClick={() =>
                navigate('/prescriptions/new', {
                  state: { chiefComplaint: doctorNotes },
                })
              }
              className="mt-2"
            >
              Convert Notes to Rx Prescription
            </Button>
          </div>

          {/* Secure Chat Box */}
          <div className="h-48 bg-slate-900 rounded-2xl p-3 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-1.5 overflow-y-auto flex-1 text-[11px] pr-1">
              {messages.map((msg, i) => (
                <div key={i} className="leading-tight">
                  <span className="font-bold text-teal-400">{msg.sender}: </span>
                  <span className="text-slate-300">{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Send message to patient..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 rounded-xl text-xs text-white border border-slate-800 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-bold"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
