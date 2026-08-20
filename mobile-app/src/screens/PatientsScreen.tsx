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
import { Patient } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import {
  Users,
  Search,
  Phone,
  Droplets,
  Calendar,
  FileText,
  Plus,
} from 'lucide-react-native';

interface PatientsScreenProps {
  patients: Patient[];
  onAddPatient: (name: string, phone: string, age: number, bloodGroup: string) => void;
}

export const PatientsScreen: React.FC<PatientsScreenProps> = ({
  patients,
  onAddPatient,
}) => {
  const [search, setSearch] = useState('');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.uhid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search & Header */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search UHID, patient name, phone..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.headerCount}>
        <Text style={styles.countText}>{filtered.length} Registered Patients</Text>
      </View>

      {/* Patient Cards */}
      {filtered.map((patient) => (
        <GlassCard key={patient.id} style={styles.patientCard}>
          <View style={styles.topRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{patient.name[0]}</Text>
            </View>
            <View style={styles.patientMain}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.uhidText}>{patient.uhid}</Text>
            </View>
            {patient.bloodGroup && (
              <View style={styles.bloodBadge}>
                <Droplets size={12} color={colors.emergency} />
                <Text style={styles.bloodText}>{patient.bloodGroup}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Phone size={14} color={colors.textMuted} />
              <Text style={styles.infoValue}>{patient.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={14} color={colors.textMuted} />
              <Text style={styles.infoValue}>Last: {patient.lastVisit || 'N/A'}</Text>
            </View>
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
  headerCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  patientCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  patientMain: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  uhidText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  bloodText: {
    ...typography.caption,
    color: colors.emergency,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
