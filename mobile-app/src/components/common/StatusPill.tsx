import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { DeploymentStatus, SslStatus, ContainerState } from '../../types';

interface StatusPillProps {
  status: DeploymentStatus | SslStatus | ContainerState | 'ONLINE' | 'OFFLINE';
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  const isAnimated =
    status === 'BUILDING' ||
    status === 'DEPLOYING' ||
    status === 'PROVISIONING' ||
    status === 'HEALTHY' ||
    status === 'ONLINE' ||
    status === 'RUNNING';

  useEffect(() => {
    if (isAnimated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isAnimated]);

  const getConfig = () => {
    switch (status) {
      case 'HEALTHY':
      case 'ONLINE':
      case 'RUNNING':
      case 'ISSUED':
        return {
          bg: colors.successBg,
          border: colors.successBorder,
          text: colors.success,
          dot: colors.success,
          label: status === 'ISSUED' ? 'SSL ACTIVE' : status,
        };
      case 'BUILDING':
      case 'DEPLOYING':
      case 'PROVISIONING':
      case 'RESTARTING':
        return {
          bg: colors.warningBg,
          border: colors.warningBorder,
          text: colors.warning,
          dot: colors.warning,
          label: status,
        };
      case 'ROLLED_BACK':
        return {
          bg: '#8B5CF61A',
          border: '#8B5CF633',
          text: colors.purple,
          dot: colors.purple,
          label: 'ROLLED BACK',
        };
      case 'FAILED':
      case 'OFFLINE':
      case 'STOPPED':
        return {
          bg: colors.errorBg,
          border: colors.errorBorder,
          text: colors.error,
          dot: colors.error,
          label: status,
        };
      default:
        return {
          bg: colors.surfaceSubtle,
          border: colors.border,
          text: colors.textSecondary,
          dot: colors.textMuted,
          label: status,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.pill,
        size === 'sm' ? styles.pillSm : styles.pillMd,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          size === 'sm' ? styles.dotSm : styles.dotMd,
          { backgroundColor: config.dot, opacity: isAnimated ? pulseAnim : 1 },
        ]}
      />
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: config.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  pillSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  dot: {
    borderRadius: 10,
  },
  dotMd: {
    width: 6,
    height: 6,
  },
  dotSm: {
    width: 5,
    height: 5,
  },
  label: {
    ...typography.badge,
    textTransform: 'uppercase',
  },
  labelMd: {
    fontSize: 11,
  },
  labelSm: {
    fontSize: 9.5,
  },
});
