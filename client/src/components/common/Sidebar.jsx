import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  Baby,
  CreditCard,
  Video,
  BarChart3,
  Settings,
  Sparkles,
  BookmarkCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { isDoctor, isReceptionist, isClinicAdmin, activeClinic } = useAuth();

  const navGroups = [
    {
      title: 'Clinical Operations',
      items: [
        {
          to: '/queue',
          label: 'Live OPD Queue',
          icon: Clock,
          badge: 'Live',
          badgeColor: 'emerald',
        },
        {
          to: '/prescriptions/new',
          label: 'Speed Rx Studio',
          icon: Sparkles,
          show: isDoctor,
        },
        {
          to: '/patients',
          label: 'Patients & EHR',
          icon: Users,
        },
        {
          to: '/templates',
          label: 'Rx Templates',
          icon: BookmarkCheck,
          show: isDoctor,
        },
      ],
    },
    {
      title: 'Speciality & Telehealth',
      items: [
        {
          to: '/pediatric',
          label: 'Pediatric & Vaccines',
          icon: Baby,
          badge: 'IAP',
          badgeColor: 'teal',
        },
        {
          to: '/teleconsultation',
          label: 'Teleconsultation',
          icon: Video,
        },
      ],
    },
    {
      title: 'Finance & Practice',
      items: [
        {
          to: '/billing',
          label: 'Billing & Invoices',
          icon: CreditCard,
        },
        {
          to: '/analytics',
          label: 'Practice Analytics',
          icon: BarChart3,
          show: isDoctor || isClinicAdmin,
        },
        {
          to: '/settings',
          label: 'Clinic Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items
                  .filter((item) => item.show !== false)
                  .map((item, iIdx) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={iIdx}
                        to={item.to}
                        onClick={() => closeSidebar && closeSidebar()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                            isActive
                              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 transition-colors ${
                                  isActive
                                    ? 'text-white'
                                    : 'text-slate-400 group-hover:text-teal-600'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isActive
                                    ? 'bg-teal-700 text-teal-100'
                                    : item.badgeColor === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-teal-50 text-teal-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Clinic Status card */}
        {activeClinic && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                {activeClinic.name.charAt(0)}
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {activeClinic.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {activeClinic.code || 'DOCPA-CLINIC'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
