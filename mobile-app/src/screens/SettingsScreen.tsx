import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { User } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { api, API_BASE_URL } from '../services/api';
import {
  Building2,
  Stethoscope,
  Volume2,
  Vibrate,
  Globe,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react-native';

interface SettingsScreenProps {
  user: User | null;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onLogout }) => {
  const [audioAnnounce, setAudioAnnounce] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkServerHealth().then((online) => setServerOnline(online));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <GlassCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Stethoscope size={24} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name || 'Dr. Anand Verma'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Doctor'} • {user?.clinicName || 'Docpa Care OPD'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'doctor@docpa.com'}</Text>
        </View>
      </GlassCard>

      {/* Cloud Server Connectivity */}
      <GlassCard style={styles.serverCard}>
        <View style={styles.serverHeader}>
          <Globe size={18} color={colors.primary} />
          <Text style={styles.serverTitle}>Docpa Cloud Backend</Text>
        </View>
        <View style={styles.serverStatusRow}>
          <Text style={styles.serverUrl}>{API_BASE_URL}</Text>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: colors.emerald }]} />
            <Text style={styles.statusText}>Connected</Text>
          </View>
        </View>
      </GlassCard>

      {/* OPD Alerts Preferences */}
      <GlassCard style={styles.prefCard}>
        <Text style={styles.prefHeading}>OPD & Queue Notifications</Text>

        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <Volume2 size={18} color={colors.textSecondary} />
            <Text style={styles.prefLabel}>Token Calling Audio Voice</Text>
          </View>
          <Switch
            value={audioAnnounce}
            onValueChange={setAudioAnnounce}
            trackColor={{ false: colors.surfaceHover, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <Vibrate size={18} color={colors.textSecondary} />
            <Text style={styles.prefLabel}>Haptic Feedback on Call</Text>
          </View>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            trackColor={{ false: colors.surfaceHover, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </GlassCard>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <LogOut size={18} color={colors.emergency} />
        <Text style={styles.logoutText}>Sign Out of Clinic Session</Text>
      </TouchableOpacity>
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
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 3,
    flex: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  userRole: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  serverCard: {
    padding: 16,
    borderRadius: 18,
    gap: 10,
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  serverStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
  },
  serverUrl: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.tiny,
    color: colors.emerald,
    fontWeight: '700',
  },
  prefCard: {
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  prefHeading: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.emergency,
  },
});
