import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage = () => {
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpChannel, setOtpChannel] = useState('mobile'); // 'mobile' | 'email'
  const [otpRecipient, setOtpRecipient] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginWithPassword, sendOtp, loginWithOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter your email/phone and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(identifier, password);
      showToast('Signed in successfully! Welcome back.');
      navigate('/queue');
    } catch (err) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpRecipient) {
      showToast('Please enter your registered phone or email', 'warning');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(otpChannel, otpRecipient);
      setOtpSent(true);
      showToast(`Verification code sent to ${otpRecipient}`);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP. Try password login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue) {
      showToast('Please enter the 6-digit OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      await loginWithOtp(otpChannel, otpRecipient, otpValue);
      showToast('OTP verified successfully!');
      navigate('/queue');
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 border border-teal-300/30">
            <Stethoscope className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Docpa EMR & Clinic Suite
        </h2>
        <p className="mt-1 text-center text-xs font-medium text-teal-300">
          Ultra-Fast Clinical Prescriptions & OPD Queue Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/20">
          {/* Auth Method Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMethod === 'password'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMethod === 'otp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Instant OTP Login
            </button>
          </div>

          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Email or Mobile Number"
                placeholder="doctor@docpa.com / 9876543210"
                icon={Mail}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 mr-2"
                  />
                  Remember session
                </label>
                <a href="#forgot" className="font-semibold text-teal-600 hover:text-teal-700">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 shadow-lg shadow-teal-600/20"
                size="lg"
                icon={ArrowRight}
              >
                Sign In to Clinic
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setOtpChannel('mobile')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        otpChannel === 'mobile'
                          ? 'border-teal-600 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      SMS Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpChannel('email')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        otpChannel === 'email'
                          ? 'border-teal-600 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Email OTP
                    </button>
                  </div>

                  <Input
                    label={otpChannel === 'mobile' ? 'Mobile Number' : 'Email Address'}
                    placeholder={otpChannel === 'mobile' ? '9876543210' : 'dr.name@clinic.com'}
                    icon={otpChannel === 'mobile' ? Phone : Mail}
                    value={otpRecipient}
                    onChange={(e) => setOtpRecipient(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full mt-2"
                    size="lg"
                    icon={KeyRound}
                  >
                    Send 6-Digit OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-teal-50 rounded-xl text-xs text-teal-800 border border-teal-200 flex items-center justify-between">
                    <div>
                      <span>OTP sent to: </span>
                      <strong>{otpRecipient}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-teal-600 underline font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  <Input
                    label="Enter 6-Digit Verification Code"
                    placeholder="123456"
                    icon={ShieldCheck}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    maxLength={6}
                    required
                    className="text-center tracking-widest text-lg font-bold font-mono"
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full mt-2"
                    size="lg"
                    icon={CheckCircle2}
                  >
                    Verify & Access Dashboard
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Registration Footnote */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New Doctor or Clinic Manager?{' '}
              <Link
                to="/register"
                className="font-bold text-teal-600 hover:text-teal-700 underline"
              >
                Register Your Clinic Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
