import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ClinicMetrics } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react-native';

interface DoctorOverviewScreenProps {
  metrics: ClinicMetrics;
}

export const DoctorOverviewScreen: React.FC<DoctorOverviewScreenProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total OPD Patients',
      value: metrics.totalTokensToday,
      sub: 'Issued Today',
      icon: Users,
      color: colors.primary,
    },
    {
      title: 'Consultations Done',
      value: metrics.servedCount,
      sub: `${Math.round((metrics.servedCount / (metrics.totalTokensToday || 1)) * 100)}% Throughput`,
      icon: CheckCircle2,
      color: colors.emerald,
    },
    {
      title: 'In Waiting Room',
      value: metrics.waitingCount,
      sub: 'Next up in OPD queue',
      icon: Clock,
      color: colors.waiting,
    },
    {
      title: 'Avg Time Per Patient',
      value: `${metrics.avgConsultationMinutes}m`,
      sub: 'Consultation Velocity',
      icon: Zap,
      color: colors.secondary,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Daily Clinic Performance</Text>

      <View style={styles.metricGrid}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <GlassCard key={idx} style={styles.metricCard}>
              <View style={styles.metricTop}>
                <View style={[styles.iconBg, { backgroundColor: `${card.color}20` }]}>
                  <Icon size={18} color={card.color} />
                </View>
                <Text style={styles.metricValue}>{card.value}</Text>
              </View>
              <View style={styles.metricBottom}>
                <Text style={styles.metricTitle}>{card.title}</Text>
                <Text style={styles.metricSub}>{card.sub}</Text>
              </View>
            </GlassCard>
          );
        })}
      </View>

      {/* Live OPD Status Box */}
      <GlassCard style={styles.opdStatusCard}>
        <View style={styles.statusHeader}>
          <Activity size={18} color={colors.emerald} />
          <Text style={styles.statusTitle}>Real-time Queue Health</Text>
        </View>
        <Text style={styles.statusDesc}>
          OPD is operating at optimal flow. Estimated wait time for new walk-ins is currently under 15 minutes.
        </Text>
      </GlassCard>
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
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  metricBottom: {
    gap: 2,
  },
  metricTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  metricSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  opdStatusCard: {
    padding: 16,
    borderRadius: 18,
    gap: 8,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    ...typography.bodyBold,
    color: colors.emerald,
  },
  statusDesc: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
