import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Tv, Stethoscope, Bell, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const TvDisplayQueue = () => {
  const { clinicId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCalledToken, setLastCalledToken] = useState(null);

  const fetchTvQueue = useCallback(async () => {
    if (!clinicId) return;
    try {
      const res = await axios.get(`/api/v1/queue/tv-display/${clinicId}`);
      const queueData = res.data?.data || {};
      setData(queueData);

      // Play chime if new token called
      const currentToken = queueData.now_calling?.token_number;
      if (currentToken && currentToken !== lastCalledToken) {
        setLastCalledToken(currentToken);
        playChime();
      }
    } catch (err) {
      console.error('Failed to fetch TV display queue:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId, lastCalledToken]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  useEffect(() => {
    fetchTvQueue();
    const interval = setInterval(fetchTvQueue, 8000); // 8s live refresh
    return () => clearInterval(interval);
  }, [fetchTvQueue]);

  const nowCalling =
    data?.calling_now?.[0] || data?.now_calling || null;
  const waitingList =
    data?.upcoming || data?.waiting_queue || [];
  const clinic = data?.clinic || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans select-none overflow-hidden">
      {/* 1. Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {clinic.name || 'Docpa Multispeciality Clinic'}
            </h1>
            <p className="text-sm font-semibold text-teal-400 mt-0.5">
              Live OPD Waiting Room & Consultation Display
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono tracking-wider text-slate-200">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* 2. Main Live Stage: Left = NOW CALLING, Right = UPCOMING TOKENS */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
        {/* BIG 'NOW CALLING' HERO STAGE */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 p-8 sm:p-12 border-2 border-teal-500/40 shadow-2xl shadow-teal-500/10 text-center overflow-hidden">
            {/* Animated Callout Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg mb-6 animate-pulse">
              <Bell className="w-4 h-4" />
              NOW CONSULTING (CABIN 1)
            </div>

            {nowCalling ? (
              <div className="space-y-4">
                <div className="font-mono text-8xl sm:text-9xl font-black tracking-tighter text-teal-400 drop-shadow-[0_0_35px_rgba(20,184,166,0.3)]">
                  {nowCalling.token_number}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {nowCalling.patient_id?.name || 'Walk-in Patient'}
                </div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                  UHID: {nowCalling.patient_id?.uhid || 'UHID-000000'} • Dr. In Room
                </div>
              </div>
            ) : (
              <div className="py-12 text-slate-400">
                <Clock className="w-16 h-16 mx-auto mb-4 text-slate-600 animate-spin" />
                <p className="text-2xl font-bold text-slate-300">Doctor Ready for Next Patient</p>
                <p className="text-xs text-slate-500 mt-2">Next token will appear shortly.</p>
              </div>
            )}
          </div>
        </div>

        {/* UPCOMING WAITING QUEUE LIST */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Next In Queue ({waitingList.length})
              </span>
              <span className="text-xs text-teal-400 font-semibold">Please be seated</span>
            </div>

            {waitingList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No other patients waiting in OPD queue.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {waitingList.slice(0, 6).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 text-teal-400 font-mono font-black text-xl flex items-center justify-center border border-slate-700">
                        {item.token_number}
                      </div>
                      <div>
                        <p className="font-extrabold text-base text-slate-200">
                          {item.patient_id?.name || 'Walk-in'}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {item.visit_type ? item.visit_type.replace('_', ' ') : 'Consultation'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                      Waiting
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Footer Marquee Ticker */}
      <footer className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live OPD System Active</span>
        </div>
        <p className="text-slate-400">
          Kindly sanitize hands & present token when your number is called.
        </p>
        <div className="font-mono text-[11px] text-slate-400">Docpa Healthcare Suite</div>
      </footer>
    </div>
  );
};
