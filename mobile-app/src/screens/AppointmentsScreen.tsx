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
import { Appointment } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { StatusPill } from '../components/common/StatusPill';
import {
  Calendar,
  Clock,
  UserCheck,
  Search,
  CheckCircle,
  Plus,
} from 'lucide-react-native';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  onCheckIn: (appointmentId: string) => void;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  onCheckIn,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMED' | 'CHECKED_IN'>('ALL');

  const filtered = appointments
    .filter((a) => {
      if (activeFilter === 'CONFIRMED') return a.status === 'CONFIRMED';
      if (activeFilter === 'CHECKED_IN') return a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION';
      return true;
    })
    .filter((a) => a.patientName.toLowerCase().includes(search.toLowerCase()) || a.patientPhone.includes(search));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date Header */}
      <GlassCard style={styles.dateBar}>
        <View style={styles.dateLeft}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.dateText}>Today • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        <Text style={styles.slotCount}>{appointments.length} Total Booked</Text>
      </GlassCard>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'CONFIRMED', 'CHECKED_IN'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter === 'ALL' ? 'All Slots' : filter === 'CONFIRMED' ? 'Pending Check-in' : 'In Queue'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient name or phone..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Appointment Cards */}
      {filtered.map((apt) => (
        <GlassCard key={apt.id} style={styles.aptCard}>
          <View style={styles.aptHeader}>
            <View style={styles.timeBox}>
              <Clock size={14} color={colors.primary} />
              <Text style={styles.timeText}>{apt.timeSlot}</Text>
            </View>
            <StatusPill status={apt.status} size="sm" />
          </View>

          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{apt.patientName}</Text>
            <Text style={styles.patientPhone}>{apt.patientPhone} • {apt.department}</Text>
          </View>

          <View style={styles.aptFooter}>
            {apt.status === 'CONFIRMED' ? (
              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={() => onCheckIn(apt.id)}
              >
                <UserCheck size={16} color="#FFFFFF" />
                <Text style={styles.checkInBtnText}>Check In & Assign Token</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.tokenAssignedBox}>
                <CheckCircle size={14} color={colors.emerald} />
                <Text style={styles.tokenAssignedText}>Token #{apt.tokenNumber} Assigned</Text>
              </View>
            )}
          </View>
        </GlassCard>
      ))}
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
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  slotCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  searchBox: {
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
  aptCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  patientDetails: {
    gap: 3,
  },
  patientName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  patientPhone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  aptFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 10,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkInBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tokenAssignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenAssignedText: {
    ...typography.caption,
    color: colors.emerald,
    fontWeight: '700',
  },
});
