import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface MetricGaugeProps {
  label: string;
  value: number; // percentage (0-100) or absolute
  unit?: string;
  max?: number;
  color?: string;
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  unit = '%',
  max = 100,
  color = colors.primary,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.mono,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  unit: {
    color: colors.textMuted,
    fontSize: 11,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
