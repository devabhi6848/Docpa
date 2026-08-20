import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { TokenStatus, AppointmentStatus } from '../../types';

interface StatusPillProps {
  status: TokenStatus | AppointmentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SERVING':
      case 'IN_CONSULTATION':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          text: colors.serving,
          label: 'In Chamber',
        };
      case 'WAITING':
      case 'CHECKED_IN':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: colors.waiting,
          label: 'Waiting',
        };
      case 'COMPLETED':
        return {
          bg: 'rgba(100, 116, 139, 0.15)',
          border: 'rgba(100, 116, 139, 0.3)',
          text: colors.completed,
          label: 'Completed',
        };
      case 'SKIPPED':
      case 'CANCELLED':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          text: colors.skipped,
          label: 'Skipped',
        };
      case 'EMERGENCY':
        return {
          bg: 'rgba(220, 38, 38, 0.25)',
          border: colors.emergency,
          text: '#FCA5A5',
          label: '🚨 Emergency',
        };
      case 'CONFIRMED':
        return {
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.4)',
          text: colors.primary,
          label: 'Confirmed',
        };
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.3)',
          text: colors.textSecondary,
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.tiny,
    fontWeight: '700',
  },
});
