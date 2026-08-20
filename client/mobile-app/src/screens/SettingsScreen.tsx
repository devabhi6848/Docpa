import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { GlassCard } from '../components/common/GlassCard';
import {
  Globe,
  Shield,
  Bell,
  Fingerprint,
  Save,
  CheckCircle2,
  Cpu,
  Info,
} from 'lucide-react-native';

interface SettingsScreenProps {
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  apiUrl,
  onUpdateApiUrl,
}) => {
  const [currentUrl, setCurrentUrl] = useState(apiUrl);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateApiUrl(currentUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* API Endpoint Config */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Central Management API</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Target NestJS API endpoint for WebSocket telemetry and deployment pipelines.
          </Text>

          <TextInput
            style={styles.input}
            value={currentUrl}
            onChangeText={setCurrentUrl}
            placeholder="https://api.yourdomain.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={styles.saveBtn}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Saved Successfully</Text>
              </>
            ) : (
              <>
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Update API URL</Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Security & Preferences */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Security & Biometrics</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Fingerprint size={16} color={colors.textSecondary} />
              <View>
                <Text style={styles.toggleTitle}>Biometric Lock</Text>
                <Text style={styles.toggleSub}>Require FaceID / TouchID</Text>
              </View>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleLeft}>
              <Bell size={16} color={colors.textSecondary} />
              <View>
                <Text style={styles.toggleTitle}>Build Notifications</Text>
                <Text style={styles.toggleSub}>Alert on push & deploy events</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        {/* Platform Info */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Info size={18} color={colors.textMuted} />
            <Text style={styles.sectionTitle}>Platform Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoVal}>v1.0.0 (Expo SDK 51)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Core Engine</Text>
            <Text style={styles.infoVal}>DeployCraft Architecture</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reverse Proxy</Text>
            <Text style={styles.infoVal}>Caddy v2 (Auto-TLS)</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  sectionCard: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  input: {
    ...typography.mono,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  saveBtnText: {
    ...typography.badge,
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  toggleSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoVal: {
    ...typography.mono,
    color: colors.textSecondary,
    fontSize: 11.5,
  },
});
