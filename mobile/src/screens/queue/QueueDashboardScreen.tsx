import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useTodayQueue } from "../../hooks/useQueue";
import { AppointmentToken, TokenStatus } from "../../types/queue";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ClinicSelectorModal } from "../../components/shared/ClinicSelectorModal";
import { TokenActionModal } from "../../components/shared/TokenActionModal";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type QueueNavProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_FILTERS: Array<{ label: string; value: TokenStatus | "all" }> = [
  { label: "All Tokens", value: "all" },
  { label: "Waiting", value: "waiting" },
  { label: "With Doctor", value: "with_doctor" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const QueueDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<QueueNavProp>();
  const activeClinic = useAuthStore((state) => state.activeClinic);

  const [activeFilter, setActiveFilter] = useState<TokenStatus | "all">("all");
  const [selectedToken, setSelectedToken] = useState<AppointmentToken | null>(null);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [showTokenActionModal, setShowTokenActionModal] = useState(false);

  const { data: queueData, isLoading, isError, refetch, isRefetching } = useTodayQueue();

  const allTokens = queueData?.tokens || [];
  const stats = queueData?.stats || { total: 0, waiting: 0, with_doctor: 0, completed: 0, cancelled: 0 };

  const filteredTokens =
    activeFilter === "all"
      ? allTokens
      : allTokens.filter((t: AppointmentToken) => t.status === activeFilter);

  const handleTokenPress = (token: AppointmentToken) => {
    setSelectedToken(token);
    setShowTokenActionModal(true);
  };

  const getStatusBadgeVariant = (status: TokenStatus) => {
    switch (status) {
      case "with_doctor":
        return "primary";
      case "waiting":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
      case "no_show":
        return "danger";
      default:
        return "neutral";
    }
  };

  const renderTokenItem = ({ item }: { item: AppointmentToken }) => {
    const isUrgent = item.priority === "urgent" || item.priority === "emergency";
    return (
      <Card
        onPress={() => handleTokenPress(item)}
        style={{
          marginBottom: Spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: isUrgent ? colors.danger : colors.primary,
        }}
      >
        <View style={styles.tokenRow}>
          {/* Token Number Box */}
          <View style={[styles.tokenNumberBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.tokenCode, { color: colors.primary }]}>{item.token_code}</Text>
            <Text style={[styles.tokenNum, { color: colors.text }]}>#{item.token_number}</Text>
          </View>

          {/* Patient Details */}
          <View style={styles.patientInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>
                {item.patient_id?.name || "Patient"}
              </Text>
              {isUrgent && (
                <Badge
                  label={item.priority}
                  variant="danger"
                  size="sm"
                  style={{ marginLeft: Spacing.xs }}
                />
              )}
            </View>

            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.patient_id?.gender ? `${item.patient_id.gender} • ` : ""}
              {item.patient_id?.age_years ? `${item.patient_id.age_years} yrs • ` : ""}
              UHID: {item.patient_id?.uhid || "N/A"}
            </Text>

            {item.chief_complaint ? (
              <Text style={[styles.complaint, { color: colors.textMuted }]} numberOfLines={1}>
                💬 {item.chief_complaint}
              </Text>
            ) : null}
          </View>

          {/* Status Badge */}
          <View style={styles.statusCol}>
            <Badge
              label={item.status.replace("_", " ")}
              variant={getStatusBadgeVariant(item.status)}
              size="sm"
            />
            <Text style={[styles.visitType, { color: colors.textMuted }]}>
              {item.visit_type.replace("_", " ")}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="OPD Live Queue"
        showClinicSwitch
        onClinicSwitchPress={() => setShowClinicModal(true)}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => activeClinic && navigation.navigate("TvDisplay", { clinicId: activeClinic._id })}
              style={[styles.tvIconBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={{ fontSize: 18 }}>📺</Text>
            </TouchableOpacity>
            <Button
              title="+ Token"
              size="sm"
              onPress={() => navigation.navigate("GenerateToken")}
            />
          </View>
        }
      />

      {/* KPI Stats Bar */}
      <View style={[styles.kpiContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Total</Text>
        </View>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.warning }]}>{stats.waiting}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Waiting</Text>
        </View>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{stats.with_doctor}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>In Cabin</Text>
        </View>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiValue, { color: colors.success }]}>{stats.completed}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Done</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.value)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : colors.textSecondary,
                    fontWeight: isSelected ? "bold" : "500",
                    fontSize: Typography.sizes.xs + 1,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Tokens List */}
      {isLoading ? (
        <View style={styles.listContainer}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : isError ? (
        <ErrorState message="Failed to load today's OPD queue" onRetry={refetch} />
      ) : (
        <FlatList
          data={filteredTokens}
          keyExtractor={(item) => item._id}
          renderItem={renderTokenItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No patients in queue"
              description={
                activeFilter === "all"
                  ? "Generate a token to add a patient to today's consultation line."
                  : `No tokens found with status '${activeFilter}'.`
              }
              actionTitle="+ Generate First Token"
              onAction={() => navigation.navigate("GenerateToken")}
            />
          }
        />
      )}

      {/* Modals */}
      <ClinicSelectorModal
        visible={showClinicModal}
        onClose={() => setShowClinicModal(false)}
      />

      <TokenActionModal
        visible={showTokenActionModal}
        token={selectedToken}
        onClose={() => {
          setShowTokenActionModal(false);
          setSelectedToken(null);
        }}
        onNavigateToRx={(tok) => navigation.navigate("PrescriptionCreate", { token: tok, patientId: tok.patient_id?._id })}
        onNavigateToVitals={(tok) => navigation.navigate("VitalsTimeline", { patientId: tok.patient_id?._id, patientName: tok.patient_id?.name })}
        onNavigateToBilling={(tok) => navigation.navigate("CreateInvoice", { token: tok, patientId: tok.patient_id?._id })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  tvIconBtn: {
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  kpiContainer: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  kpiItem: {
    flex: 1,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  kpiLabel: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  filterBar: {
    paddingVertical: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
  },
  filterChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenNumberBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  tokenCode: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: "bold",
  },
  tokenNum: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  patientName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    maxWidth: 150,
  },
  metaText: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  complaint: {
    fontSize: Typography.sizes.xs,
    marginTop: 3,
  },
  statusCol: {
    alignItems: "flex-end",
    marginLeft: Spacing.sm,
  },
  visitType: {
    fontSize: Typography.sizes.xs - 1,
    textTransform: "capitalize",
    marginTop: 4,
  },
});
