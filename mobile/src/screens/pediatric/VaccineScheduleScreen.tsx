import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useUIStore } from "../../store/uiStore";
import { vaccineService } from "../../services/vaccine.service";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { PatientVaccine, VaccineStatus } from "../../types/vaccine";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type VaccineRouteProp = RouteProp<RootStackParamList, "VaccineSchedule">;

export const VaccineScheduleScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<VaccineRouteProp>();
  const { patientId, patientName } = route.params;

  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  const [selectedVaccine, setSelectedVaccine] = useState<PatientVaccine | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vaccineSchedule", patientId],
    queryFn: async () => {
      const res = await vaccineService.getPatientVaccineSchedule(patientId);
      return res.data;
    },
    enabled: Boolean(patientId),
  });

  const markGivenMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVaccine) return;
      return vaccineService.markVaccineGiven(selectedVaccine._id, {
        brand_name: brandName.trim() || undefined,
        batch_number: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccineSchedule", patientId] });
      showToast("Vaccine recorded as given", "success");
      setShowMarkModal(false);
      setSelectedVaccine(null);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to record vaccine", "error");
    },
  });

  const getStatusBadge = (status: VaccineStatus) => {
    switch (status) {
      case "given":
        return { label: "Given", variant: "success" as const };
      case "due":
        return { label: "Due Now", variant: "danger" as const };
      case "missed":
        return { label: "Missed", variant: "warning" as const };
      case "upcoming":
      default:
        return { label: "Upcoming", variant: "info" as const };
    }
  };

  const renderVaccineItem = ({ item }: { item: PatientVaccine }) => {
    const statusInfo = getStatusBadge(item.status);
    const isGiven = item.status === "given";

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.milestoneBadge}>
            <Text style={[styles.milestoneText, { color: colors.primary }]}>
              {item.age_milestone}
            </Text>
          </View>
          <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
        </View>

        <Text style={[styles.vaccineName, { color: colors.text }]}>{item.vaccine_name}</Text>
        {item.disease_covered ? (
          <Text style={[styles.disease, { color: colors.textSecondary }]}>
            Protects against: {item.disease_covered}
          </Text>
        ) : null}

        <View style={styles.dateRow}>
          <Text style={[styles.dueDate, { color: colors.textMuted }]}>
            Due: {new Date(item.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </Text>
          {isGiven && item.given_date ? (
            <Text style={[styles.givenDate, { color: colors.success }]}>
              ✓ Given on: {new Date(item.given_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          ) : null}
        </View>

        {!isGiven && (
          <Button
            title="Mark as Administered / Given"
            size="sm"
            variant="outline"
            onPress={() => {
              setSelectedVaccine(item);
              setBrandName(item.brand_name || "");
              setBatchNumber(item.batch_number || "");
              setShowMarkModal(true);
            }}
            style={{ marginTop: Spacing.sm }}
          />
        )}
      </Card>
    );
  };

  const schedule = data?.schedule || [];
  const summary = data?.summary || { total: 0, given: 0, due: 0, upcoming: 0, missed: 0 };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="IAP Vaccine Schedule"
        showBack
        subtitle={patientName ? `Patient: ${patientName}` : undefined}
      />

      {/* Vaccine Progress Bar */}
      <View style={[styles.progressCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.progRow}>
          <Text style={[styles.progTitle, { color: colors.text }]}>Immunization Coverage</Text>
          <Text style={[styles.progCount, { color: colors.primary }]}>
            {summary.given} / {summary.total} Doses Given
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={schedule}
          keyExtractor={(item) => item._id}
          renderItem={renderVaccineItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No vaccine schedule generated"
              description="Immunization milestones will appear here."
            />
          }
        />
      )}

      {/* Administer Vaccine Modal */}
      <Modal
        visible={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        title={selectedVaccine ? `Administer: ${selectedVaccine.vaccine_name}` : "Administer Vaccine"}
        footer={
          <Button
            title="Confirm Vaccine Administered"
            onPress={() => markGivenMutation.mutate()}
            isLoading={markGivenMutation.isPending}
          />
        }
      >
        <Input
          label="Vaccine Brand Name (Optional)"
          placeholder="e.g. Hexaxim, Rotavac, Prevenar 13"
          value={brandName}
          onChangeText={setBrandName}
        />

        <Input
          label="Batch Number / Lot #"
          placeholder="e.g. BATCH-2026-X9"
          value={batchNumber}
          onChangeText={setBatchNumber}
        />

        <Input
          label="Administration Notes / Route"
          placeholder="e.g. Given Intramuscular (IM) in right thigh"
          value={notes}
          onChangeText={setNotes}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  progressCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  progRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
  },
  progCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  milestoneBadge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  milestoneText: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
  },
  vaccineName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  disease: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  dueDate: {
    fontSize: Typography.sizes.xs,
  },
  givenDate: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
  },
});
