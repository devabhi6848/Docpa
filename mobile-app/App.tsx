import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme/colors';
import { TabType, QueueItem, Appointment, Patient, User, ClinicMetrics } from './src/types';
import {
  INITIAL_QUEUE,
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
} from './src/services/api';
import { Header } from './src/components/common/Header';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { QueueDashboardScreen } from './src/screens/QueueDashboardScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { PatientsScreen } from './src/screens/PatientsScreen';
import { DoctorOverviewScreen } from './src/screens/DoctorOverviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'u-101',
    name: 'Dr. Anand Verma',
    email: 'doctor@docpa.com',
    role: 'DOCTOR',
    clinicName: 'Docpa Healthcare OPD',
  });
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);

  // Call Next Token in Live Queue
  const handleCallNext = () => {
    setQueue((prevQueue) => {
      let updated = [...prevQueue];
      // Mark current serving as completed
      const servingIdx = updated.findIndex((q) => q.status === 'SERVING');
      if (servingIdx !== -1) {
        updated[servingIdx] = { ...updated[servingIdx], status: 'COMPLETED' };
      }

      // Find first emergency or waiting patient
      const nextIdx = updated.findIndex(
        (q) => q.status === 'EMERGENCY' || q.status === 'WAITING'
      );
      if (nextIdx !== -1) {
        updated[nextIdx] = { ...updated[nextIdx], status: 'SERVING', estimatedWaitMinutes: 0 };
      }
      return updated;
    });
  };

  const handleSkipToken = (id: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'SKIPPED' } : q))
    );
    handleCallNext();
  };

  const handleCompleteToken = (id: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'COMPLETED' } : q))
    );
    handleCallNext();
  };

  const handleAddWalkin = (
    name: string,
    phone: string,
    age: number,
    isEmergency: boolean
  ) => {
    const nextTokenNum = Math.max(...queue.map((q) => q.tokenNumber), 10) + 1;
    const newItem: QueueItem = {
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNum,
      patientName: name,
      patientPhone: phone,
      patientAge: age,
      gender: 'MALE',
      doctorName: currentUser?.name || 'Dr. Anand Verma',
      status: isEmergency ? 'EMERGENCY' : 'WAITING',
      estimatedWaitMinutes: isEmergency ? 2 : (queue.filter((q) => q.status === 'WAITING').length + 1) * 8,
      checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEmergency,
    };
    setQueue((prev) => (isEmergency ? [newItem, ...prev] : [...prev, newItem]));
  };

  const handleCheckInAppointment = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const nextTokenNum = Math.max(...queue.map((q) => q.tokenNumber), 10) + 1;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'CHECKED_IN', tokenNumber: nextTokenNum }
          : a
      )
    );

    const newItem: QueueItem = {
      id: `tok-apt-${appointmentId}`,
      tokenNumber: nextTokenNum,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      patientAge: 35,
      gender: 'MALE',
      doctorName: apt.doctorName,
      status: 'WAITING',
      estimatedWaitMinutes: (queue.filter((q) => q.status === 'WAITING').length + 1) * 8,
      checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setQueue((prev) => [...prev, newItem]);
  };

  const currentServing = queue.find((q) => q.status === 'SERVING');
  const waitingCount = queue.filter(
    (q) => q.status === 'WAITING' || q.status === 'EMERGENCY'
  ).length;

  const metrics: ClinicMetrics = {
    totalTokensToday: queue.length,
    servedCount: queue.filter((q) => q.status === 'COMPLETED').length,
    waitingCount,
    skippedCount: queue.filter((q) => q.status === 'SKIPPED').length,
    avgConsultationMinutes: 7,
    currentServingToken: currentServing?.tokenNumber || 0,
  };

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <LoginScreen onLoginSuccess={setCurrentUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Header
          title={
            activeTab === 'queue'
              ? 'OPD Live Queue'
              : activeTab === 'appointments'
              ? 'Daily Bookings'
              : activeTab === 'patients'
              ? 'Patient Registry'
              : activeTab === 'overview'
              ? 'Clinic Performance'
              : 'Settings & Profile'
          }
          subtitle={
            activeTab === 'queue'
              ? `${waitingCount} patients waiting in queue`
              : activeTab === 'appointments'
              ? `${appointments.length} appointments scheduled`
              : undefined
          }
          clinicName={currentUser.clinicName}
          activeToken={currentServing?.tokenNumber || 0}
        />

        <View style={styles.body}>
          {activeTab === 'queue' && (
            <QueueDashboardScreen
              queue={queue}
              onCallNext={handleCallNext}
              onSkipToken={handleSkipToken}
              onCompleteToken={handleCompleteToken}
              onAddWalkin={handleAddWalkin}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsScreen
              appointments={appointments}
              onCheckIn={handleCheckInAppointment}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsScreen
              patients={patients}
              onAddPatient={(name, phone, age, bloodGroup) => {
                const newP: Patient = {
                  id: `pat-${Date.now()}`,
                  name,
                  phone,
                  age,
                  gender: 'MALE',
                  uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  lastVisit: 'Today',
                  bloodGroup,
                };
                setPatients((prev) => [newP, ...prev]);
              }}
            />
          )}

          {activeTab === 'overview' && (
            <DoctorOverviewScreen metrics={metrics} />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              user={currentUser}
              onLogout={() => setCurrentUser(null)}
            />
          )}
        </View>

        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          waitingCount={waitingCount}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
