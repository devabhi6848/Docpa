import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// OPD Queue & TV Display
import { QueueDashboard } from './pages/queue/QueueDashboard';
import { TvDisplayQueue } from './pages/queue/TvDisplayQueue';

// Prescription EMR
import { PrescriptionStudio } from './pages/prescriptions/PrescriptionStudio';
import { PrescriptionDetail } from './pages/prescriptions/PrescriptionDetail';
import { RxTemplateManager } from './pages/prescriptions/RxTemplateManager';

// Patients
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientProfilePage } from './pages/patients/PatientProfilePage';

// Pediatric
import { PediatricDashboard } from './pages/pediatric/PediatricDashboard';

// Billing
import { BillingDashboard } from './pages/billing/BillingDashboard';
import { InvoiceReceipt } from './pages/billing/InvoiceReceipt';

// Teleconsultation
import { TeleconsultationList } from './pages/teleconsultation/TeleconsultationList';
import { VideoRoom } from './pages/teleconsultation/VideoRoom';

// Public Patient Portal
import { PatientPortal } from './pages/portal/PatientPortal';

// Analytics & Settings
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Standalone Displays & Patient Portal */}
      <Route path="/tv-display/:clinicId" element={<TvDisplayQueue />} />
      <Route path="/portal/patient/:patientId" element={<PatientPortal />} />
      <Route path="/teleconsultation/room/:meetingId" element={<VideoRoom />} />

      {/* Protected Clinic Operations Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route -> OPD Queue */}
        <Route index element={<Navigate to="/queue" replace />} />

        {/* OPD Queue Front-Desk */}
        <Route path="queue" element={<QueueDashboard />} />

        {/* EMR Prescription Studio */}
        <Route path="prescriptions/new" element={<PrescriptionStudio />} />
        <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
        <Route path="templates" element={<RxTemplateManager />} />

        {/* Patients EHR */}
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/:id" element={<PatientProfilePage />} />

        {/* Pediatric & Vaccine Matrix */}
        <Route path="pediatric" element={<PediatricDashboard />} />

        {/* Billing & Invoicing */}
        <Route path="billing" element={<BillingDashboard />} />
        <Route path="billing/:id" element={<InvoiceReceipt />} />

        {/* Teleconsultation Suite */}
        <Route path="teleconsultation" element={<TeleconsultationList />} />

        {/* Analytics & Settings */}
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/queue" replace />} />
    </Routes>
  );
};
