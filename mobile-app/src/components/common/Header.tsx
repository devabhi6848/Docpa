import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Stethoscope, Bell, Activity } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  clinicName?: string;
  activeToken?: number;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  clinicName = 'Docpa Care OPD',
  activeToken = 14,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <View style={styles.iconCircle}>
            <Stethoscope size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.brandTitle}>DOCPA</Text>
            <Text style={styles.clinicSubtitle}>{clinicName}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.liveBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTokenText}>OPD #{activeToken}</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={onNotificationPress}>
            <Bell size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  brandTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  clinicSubtitle: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
  liveTokenText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.emerald,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  titleSection: {
    gap: 4,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
