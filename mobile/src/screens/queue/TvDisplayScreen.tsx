import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { RootStackParamList } from "../../navigation/types";
import { queueService } from "../../services/queue.service";
import { Header } from "../../components/ui/Header";
import { AppointmentToken } from "../../types/queue";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type TvRouteProp = RouteProp<RootStackParamList, "TvDisplay">;

export const TvDisplayScreen: React.FC = () => {
  const route = useRoute<TvRouteProp>();
  const { clinicId } = route.params;

  const { data } = useQuery({
    queryKey: ["tv-display", clinicId],
    queryFn: async () => {
      const res = await queueService.getTvDisplayQueue(clinicId);
      return res.data;
    },
    refetchInterval: 5000, // Live Kiosk Display poll every 5s
  });

  const tokens = data?.tokens || [];
  const withDoctorTokens = tokens.filter((t: AppointmentToken) => t.status === "with_doctor");
  const waitingTokens = tokens.filter((t: AppointmentToken) => t.status === "waiting");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Waiting Room TV Display" showBack subtitle="Auto-refreshing live queue" />

      <View style={styles.body}>
        {/* Active Consultation Section */}
        <View style={styles.activeSection}>
          <Text style={styles.activeHeading}>NOW CALLING / IN CABIN</Text>
          {withDoctorTokens.length === 0 ? (
            <View style={styles.emptyCalling}>
              <Text style={styles.emptyCallingText}>No consultation currently in progress</Text>
            </View>
          ) : (
            withDoctorTokens.map((item: AppointmentToken) => (
              <View key={item._id} style={styles.activeCard}>
                <Text style={styles.activeTokenNumber}>{item.token_code}</Text>
                <Text style={styles.activePatientName}>{item.patient_id?.name || "Patient"}</Text>
                <Text style={styles.cabinText}>Please proceed to Doctor Cabin</Text>
              </View>
            ))
          )}
        </View>

        {/* Up Next / Waiting Queue */}
        <View style={styles.waitingSection}>
          <Text style={styles.waitingHeading}>UP NEXT IN QUEUE</Text>
          <FlatList
            data={waitingTokens}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.waitingItem}>
                <View style={styles.waitingBadge}>
                  <Text style={styles.waitingBadgeText}>#{index + 1}</Text>
                </View>
                <Text style={styles.waitingToken}>{item.token_code}</Text>
                <Text style={styles.waitingName} numberOfLines={1}>
                  {item.patient_id?.name || "Patient"}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyWaitingText}>No waiting patients in queue</Text>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
  },
  activeSection: {
    backgroundColor: "#1E293B",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  activeHeading: {
    color: "#14B8A6",
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  emptyCalling: {
    padding: Spacing.md,
  },
  emptyCallingText: {
    color: "#94A3B8",
    fontSize: Typography.sizes.md,
  },
  activeCard: {
    alignItems: "center",
  },
  activeTokenNumber: {
    fontSize: 56,
    fontWeight: "900",
    color: "#F8FAFC",
  },
  activePatientName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: "bold",
    color: "#38BDF8",
    marginTop: Spacing.xs,
  },
  cabinText: {
    fontSize: Typography.sizes.sm,
    color: "#A7F3D0",
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  waitingSection: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  waitingHeading: {
    color: "#94A3B8",
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  waitingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  waitingBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  waitingBadgeText: {
    color: "#F8FAFC",
    fontWeight: "bold",
    fontSize: Typography.sizes.xs,
  },
  waitingToken: {
    fontSize: Typography.sizes.lg,
    fontWeight: "bold",
    color: "#14B8A6",
    marginRight: Spacing.md,
  },
  waitingName: {
    fontSize: Typography.sizes.md,
    color: "#F8FAFC",
    flex: 1,
  },
  emptyWaitingText: {
    color: "#64748B",
    textAlign: "center",
    padding: Spacing.lg,
  },
});
