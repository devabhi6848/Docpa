import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { QueueItem } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import { ModalSheet } from '../components/common/ModalSheet';
import {
  PhoneForwarded,
  CheckCircle2,
  SkipForward,
  AlertTriangle,
  UserPlus,
  Clock,
  User,
  Search,
  Volume2,
} from 'lucide-react-native';

interface QueueDashboardScreenProps {
  queue: QueueItem[];
  onCallNext: () => void;
  onSkipToken: (id: string) => void;
  onCompleteToken: (id: string) => void;
  onAddWalkin: (patientName: string, phone: string, age: number, isEmergency: boolean) => void;
}

export const QueueDashboardScreen: React.FC<QueueDashboardScreenProps> = ({
  queue,
  onCallNext,
  onSkipToken,
  onCompleteToken,
  onAddWalkin,
}) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAge, setNewAge] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const currentServing = queue.find((q) => q.status === 'SERVING');
  const waitingList = queue
    .filter((q) => q.status === 'WAITING' || q.status === 'EMERGENCY')
    .filter((q) => q.patientName.toLowerCase().includes(search.toLowerCase()) || q.tokenNumber.toString().includes(search));
  const completedList = queue.filter((q) => q.status === 'COMPLETED' || q.status === 'SKIPPED');

  const handleCreateWalkin = () => {
    if (!newName.trim()) return;
    onAddWalkin(newName, newPhone || '+91 98765 00000', parseInt(newAge) || 30, isEmergency);
    setNewName('');
    setNewPhone('');
    setNewAge('');
    setIsEmergency(false);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero: Active Serving Token Board */}
      <GlassCard style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.heroBadgeText}>NOW CONSULTING</Text>
          </View>
          <TouchableOpacity style={styles.announcementBtn}>
            <Volume2 size={16} color={colors.primary} />
            <Text style={styles.announcementText}>Announce</Text>
          </TouchableOpacity>
        </View>

        {currentServing ? (
          <View style={styles.heroBody}>
            <View style={styles.tokenNumberCircle}>
              <Text style={styles.tokenHeroNumber}>#{currentServing.tokenNumber}</Text>
            </View>

            <View style={styles.patientHeroInfo}>
              <Text style={styles.heroPatientName}>{currentServing.patientName}</Text>
              <Text style={styles.heroPatientMeta}>
                {currentServing.patientAge} Yrs • {currentServing.gender} • {currentServing.doctorName}
              </Text>
              {currentServing.notes && (
                <Text style={styles.heroNotes}>Chief Complaint: {currentServing.notes}</Text>
              )}
            </View>

            {/* Token Action Controls */}
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => onCompleteToken(currentServing.id)}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.skipBtn]}
                onPress={() => onSkipToken(currentServing.id)}
              >
                <SkipForward size={18} color={colors.skipped} />
                <Text style={[styles.actionBtnText, { color: colors.skipped }]}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.callNextBtn]}
                onPress={onCallNext}
              >
                <PhoneForwarded size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Call Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noServingBox}>
            <Text style={styles.noServingText}>Chamber is Ready</Text>
            <TouchableOpacity style={styles.callNextHeroBtn} onPress={onCallNext}>
              <PhoneForwarded size={18} color="#FFFFFF" />
              <Text style={styles.callNextHeroText}>Call First Patient</Text>
            </TouchableOpacity>
          </View>
        )}
      </GlassCard>

      {/* Quick Action: New OPD Token / Walkin */}
      <View style={styles.quickBar}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search token # or patient name..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.walkinBtn} onPress={() => setModalVisible(true)}>
          <UserPlus size={16} color="#FFFFFF" />
          <Text style={styles.walkinBtnText}>+ Token</Text>
        </TouchableOpacity>
      </View>

      {/* Waiting Queue List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Waiting List ({waitingList.length})
        </Text>
        <Text style={styles.avgWaitText}>Avg Wait: ~8 mins/token</Text>
      </View>

      {waitingList.map((item) => (
        <GlassCard key={item.id} style={styles.queueCard}>
          <View style={styles.queueLeft}>
            <View
              style={[
                styles.tokenBadge,
                item.isEmergency && { backgroundColor: 'rgba(220, 38, 38, 0.2)', borderColor: colors.emergency },
              ]}
            >
              <Text style={[styles.tokenBadgeText, item.isEmergency && { color: '#FCA5A5' }]}>
                #{item.tokenNumber}
              </Text>
            </View>

            <View style={styles.queueInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <StatusPill status={item.isEmergency ? 'EMERGENCY' : item.status} size="sm" />
              </View>
              <Text style={styles.patientSub}>
                {item.patientAge} Yrs • {item.gender} • Checked In {item.checkedInAt}
              </Text>
            </View>
          </View>

          <View style={styles.queueRight}>
            <View style={styles.estWaitBox}>
              <Clock size={12} color={colors.waiting} />
              <Text style={styles.estWaitText}>~{item.estimatedWaitMinutes}m</Text>
            </View>
          </View>
        </GlassCard>
      ))}

      {/* Walkin Token Generation Modal */}
      <ModalSheet visible={modalVisible} onClose={() => setModalVisible(false)} title="Issue New OPD Token">
        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>Patient Full Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Ramesh Chandra"
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
          />

          <Text style={styles.inputLabel}>Contact Phone Number</Text>
          <TextInput
            style={styles.formInput}
            placeholder="+91 98765 00000"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />

          <Text style={styles.inputLabel}>Patient Age</Text>
          <TextInput
            style={styles.formInput}
            placeholder="35"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={newAge}
            onChangeText={setNewAge}
          />

          <TouchableOpacity
            style={[styles.emergencyToggle, isEmergency && styles.emergencyToggleActive]}
            onPress={() => setIsEmergency(!isEmergency)}
          >
            <AlertTriangle size={18} color={isEmergency ? '#FFFFFF' : colors.emergency} />
            <Text style={[styles.emergencyToggleText, isEmergency && { color: '#FFFFFF' }]}>
              Mark as Emergency Case (Priority #1)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitTokenBtn} onPress={handleCreateWalkin}>
            <Text style={styles.submitTokenText}>Generate Token & Print</Text>
          </TouchableOpacity>
        </View>
      </ModalSheet>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  heroCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderWidth: 1.5,
    padding: 18,
    borderRadius: 22,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
  heroBadgeText: {
    ...typography.tiny,
    color: colors.emerald,
    fontWeight: '800',
  },
  announcementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  announcementText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  heroBody: {
    alignItems: 'center',
    gap: 10,
  },
  tokenNumberCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenHeroNumber: {
    ...typography.heroToken,
    color: colors.emerald,
  },
  patientHeroInfo: {
    alignItems: 'center',
    gap: 2,
  },
  heroPatientName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  heroPatientMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heroNotes: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  completeBtn: {
    backgroundColor: colors.emerald,
  },
  skipBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  callNextBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noServingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
  },
  noServingText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  callNextHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  callNextHeroText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  quickBar: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    ...typography.body,
  },
  walkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  walkinBtnText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  avgWaitText: {
    ...typography.caption,
    color: colors.waiting,
  },
  queueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tokenBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenBadgeText: {
    ...typography.bodyBold,
    color: colors.waiting,
    fontWeight: '800',
  },
  queueInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  patientSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  queueRight: {
    alignItems: 'flex-end',
  },
  estWaitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  estWaitText: {
    ...typography.caption,
    color: colors.waiting,
    fontWeight: '700',
  },
  modalForm: {
    gap: 12,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...typography.body,
  },
  emergencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: colors.emergency,
    marginTop: 4,
  },
  emergencyToggleActive: {
    backgroundColor: colors.emergency,
  },
  emergencyToggleText: {
    ...typography.bodyBold,
    color: colors.emergency,
  },
  submitTokenBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitTokenText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
