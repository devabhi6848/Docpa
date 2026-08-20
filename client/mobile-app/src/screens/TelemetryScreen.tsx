import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Server } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { SparklineChart } from '../components/common/SparklineChart';
import { MetricGauge } from '../components/common/MetricGauge';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react-native';

interface TelemetryScreenProps {
  servers: Server[];
}

export const TelemetryScreen: React.FC<TelemetryScreenProps> = ({ servers }) => {
  const chartWidth = Dimensions.get('window').width - 72;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBanner}>
          <View style={styles.pulseDot} />
          <Text style={styles.bannerText}>Live Streaming Telemetry (3s WebSocket tick)</Text>
        </View>

        {servers.map((server) => {
          const cpuHistory = server.cpuHistory || [10, 15, 20, 25, 22, 18, 24];

          return (
            <GlassCard key={server.id} style={styles.telemetryCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.serverName}>{server.name}</Text>
                  <Text style={styles.hostText}>{server.host}</Text>
                </View>
                <View style={styles.cpuBadge}>
                  <Text style={styles.cpuValue}>{server.cpuLoad || 0}%</Text>
                  <Text style={styles.cpuLabel}>CPU LOAD</Text>
                </View>
              </View>

              {/* Sparkline Curve */}
              <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>CPU Utilization Curve</Text>
                  <Text style={styles.chartSub}>Max 100%</Text>
                </View>

                <SparklineChart
                  data={cpuHistory}
                  width={chartWidth}
                  height={90}
                  color={colors.primary}
                  gradientId={`spark-${server.id}`}
                />
              </View>

              {/* Breakdown metrics */}
              <View style={styles.breakdownGrid}>
                <View style={styles.metricBox}>
                  <View style={styles.metricHeader}>
                    <Cpu size={14} color={colors.purple} />
                    <Text style={styles.metricBoxLabel}>RAM ALLOCATED</Text>
                  </View>
                  <Text style={styles.metricBoxVal}>{server.memoryUsed} MB</Text>
                  <MetricGauge
                    label=""
                    value={server.memoryUsed || 0}
                    max={4096}
                    unit=""
                    color={colors.purple}
                  />
                </View>

                <View style={styles.metricBox}>
                  <View style={styles.metricHeader}>
                    <HardDrive size={14} color={colors.warning} />
                    <Text style={styles.metricBoxLabel}>DISK USAGE</Text>
                  </View>
                  <Text style={styles.metricBoxVal}>
                    {((server.diskUsed || 0) / 1024).toFixed(1)} GB
                  </Text>
                  <MetricGauge
                    label=""
                    value={server.diskUsed || 0}
                    max={51200}
                    unit=""
                    color={colors.warning}
                  />
                </View>
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.successBorder,
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  bannerText: {
    ...typography.badge,
    color: colors.success,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  telemetryCard: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  serverName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  hostText: {
    ...typography.mono,
    color: colors.textMuted,
    marginTop: 2,
  },
  cpuBadge: {
    alignItems: 'flex-end',
  },
  cpuValue: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  cpuLabel: {
    ...typography.badge,
    color: colors.textMuted,
    fontSize: 9,
  },
  chartContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartTitle: {
    ...typography.badge,
    color: colors.textMuted,
    fontSize: 9.5,
  },
  chartSub: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 9.5,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricBoxLabel: {
    ...typography.badge,
    color: colors.textMuted,
    fontSize: 9,
  },
  metricBoxVal: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
