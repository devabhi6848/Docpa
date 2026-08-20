import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Zap, Plus, Server, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onActionPress?: () => void;
  actionIcon?: 'plus' | 'server' | 'refresh';
  actionLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'DeployCraft',
  subtitle = 'Self-Hosted VPS Engine',
  onActionPress,
  actionIcon = 'plus',
  actionLabel,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <View style={styles.logoBadge}>
          <Zap size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {onActionPress && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActionPress}
          style={styles.actionButton}
        >
          {actionIcon === 'plus' && <Plus size={16} color="#FFFFFF" />}
          {actionIcon === 'server' && <Server size={16} color="#FFFFFF" />}
          {actionIcon === 'refresh' && <RefreshCw size={16} color="#FFFFFF" />}
          {actionLabel && <Text style={styles.actionLabel}>{actionLabel}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionLabel: {
    ...typography.badge,
    color: colors.textPrimary,
  },
});
