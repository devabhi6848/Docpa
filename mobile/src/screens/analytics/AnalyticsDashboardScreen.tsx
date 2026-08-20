import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useClinicAnalytics } from "../../hooks/useAnalytics";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

export const AnalyticsDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<"today" | "last_7_days" | "last_30_days">("last_7_days");

  const { data, isLoading } = useClinicAnalytics(timeframe);

  const stats = data || {
    timeframe,
    total_patients: 0,
    total_consultations: 0,
    total_revenue: 0,
    avg_wait_time_minutes: 0,
    revenue_by_method: {},
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Practice Analytics" subtitle="OPD & Revenue Insights" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Timeframe Switcher */}
        <View style={[styles.timeframeBar, { backgroundColor: colors.surfaceSubtle }]}>
          {(["today", "last_7_days", "last_30_days"] as const).map((tf) => {
            const isSelected = timeframe === tf;
            const labelMap = {
              today: "Today",
              last_7_days: "Last 7 Days",
              last_30_days: "Last 30 Days",
            };
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={[
                  styles.tfBtn,
                  isSelected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : colors.textSecondary,
                    fontWeight: isSelected ? "bold" : "500",
                    fontSize: Typography.sizes.xs,
                  }}
                >
                  {labelMap[tf]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: Spacing.md }}>
            <Skeleton height={100} borderRadius={16} />
            <Skeleton height={100} borderRadius={16} style={{ marginTop: Spacing.md }} />
          </View>
        ) : (
          <>
            {/* Primary KPI Grid */}
            <View style={styles.grid}>
              <Card style={[styles.gridCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Total Revenue</Text>
                <Text style={[styles.cardVal, { color: colors.text }]}>
                  ₹{(stats.total_revenue || 0).toLocaleString("en-IN")}
                </Text>
                <Text style={[styles.cardSub, { color: colors.primary }]}>Billing Collections</Text>
              </Card>

              <Card style={[styles.gridCard, { borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Total OPD Visits</Text>
                <Text style={[styles.cardVal, { color: colors.text }]}>
                  {stats.total_consultations || 0}
                </Text>
                <Text style={[styles.cardSub, { color: colors.accent }]}>Consultations Done</Text>
              </Card>

              <Card style={[styles.gridCard, { borderLeftWidth: 4, borderLeftColor: colors.success }]}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Unique Patients</Text>
                <Text style={[styles.cardVal, { color: colors.text }]}>
                  {stats.total_patients || 0}
                </Text>
                <Text style={[styles.cardSub, { color: colors.success }]}>Registered & Treated</Text>
              </Card>

              <Card style={[styles.gridCard, { borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Avg Wait Time</Text>
                <Text style={[styles.cardVal, { color: colors.text }]}>
                  {stats.avg_wait_time_minutes || 14} <Text style={{ fontSize: 13 }}>mins</Text>
                </Text>
                <Text style={[styles.cardSub, { color: colors.warning }]}>Check-in to Cabin</Text>
              </Card>
            </View>

            {/* Payment Method Breakdown */}
            <Card style={styles.breakdownCard}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                Revenue By Payment Mode
              </Text>
              {Object.keys(stats.revenue_by_method || {}).length === 0 ? (
                <Text style={{ color: colors.textMuted, marginTop: Spacing.sm }}>
                  No payment breakdown data available for this timeframe.
                </Text>
              ) : (
                Object.entries(stats.revenue_by_method).map(([method, amount]) => (
                  <View key={method} style={[styles.methodRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.methodName, { color: colors.text }]}>
                      {method.toUpperCase()}
                    </Text>
                    <Text style={[styles.methodAmount, { color: colors.primary }]}>
                      ₹{(amount as number).toLocaleString("en-IN")}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  timeframeBar: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
  },
  cardVal: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    marginVertical: 4,
  },
  cardSub: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: "bold",
  },
  breakdownCard: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  breakdownTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  methodName: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
  },
  methodAmount: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: "bold",
  },
});
