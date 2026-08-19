import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  LogOut,
  User,
  Plus,
  Tv,
  Stethoscope,
  Activity,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';
import { Button } from './Button';

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, clinics, activeClinic, switchClinic, logout, isDoctor } = useAuth();
  const [isClinicMenuOpen, setIsClinicMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClinicChange = (clinicId) => {
    switchClinic(clinicId);
    setIsClinicMenuOpen(false);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'doctor':
        return 'teal';
      case 'clinic_admin':
      case 'admin':
        return 'indigo';
      case 'nurse':
        return 'purple';
      case 'receptionist':
        return 'amber';
      default:
        return 'slate';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Sidebar Toggle & Brand / Clinic Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition lg:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Docpa <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">EMR</span>
              </span>
            </div>
          </Link>

          {/* Active Clinic Switcher Dropdown */}
          {clinics && clinics.length > 0 && (
            <div className="relative ml-2 sm:ml-4">
              <button
                type="button"
                onClick={() => setIsClinicMenuOpen(!isClinicMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">
                  {activeClinic?.name || 'Select Clinic'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isClinicMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-premium p-1.5 z-50 animate-scaleUp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    My Clinics & Branches
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {clinics.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => handleClinicChange(c._id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                          c._id === activeClinic?._id
                            ? 'bg-teal-50 text-teal-800 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-semibold">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            {c.address?.city || 'Main Clinic'}
                          </p>
                        </div>
                        {c._id === activeClinic?._id && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Waiting Room TV Display Link */}
          {activeClinic && (
            <Link
              to={`/tv-display/${activeClinic._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Open Waiting Room TV Screen"
            >
              <Tv className="w-3.5 h-3.5 text-teal-600" />
              <span>TV Display</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          )}

          {/* Rapid Prescription Studio Button for Doctors */}
          {isDoctor && (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => navigate('/prescriptions/new')}
              className="hidden sm:inline-flex shadow-sm"
            >
              New Rx (Speed EMR)
            </Button>
          )}

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <Badge variant={getRoleBadgeVariant(user?.role)} size="sm" className="mt-0.5">
                  {user?.role ? user.role.replace('_', ' ') : 'Staff'}
                </Badge>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-premium p-1.5 z-50 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.phone}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Clinic & Profile Settings
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
