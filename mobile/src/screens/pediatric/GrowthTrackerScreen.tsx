import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useUIStore } from "../../store/uiStore";
import { growthService } from "../../services/growth.service";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { GrowthRecord, NutritionalStatus } from "../../types/growth";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type GrowthRouteProp = RouteProp<RootStackParamList, "GrowthTracker">;

const NUTRITION_STATUSES: NutritionalStatus[] = [
  "Normal",
  "Mild Underweight",
  "Moderate Underweight",
  "Severe Underweight",
  "Overweight",
  "Obese",
];

export const GrowthTrackerScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<GrowthRouteProp>();
  const { patientId, patientName } = route.params;

  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);

  const [showModal, setShowModal] = useState(false);
  const [ageMonths, setAgeMonths] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [milestones, setMilestones] = useState("");
  const [nutritionalStatus, setNutritionalStatus] = useState<NutritionalStatus>("Normal");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["growthHistory", patientId],
    queryFn: async () => {
      const res = await growthService.getPatientGrowthHistory(patientId);
      return res.data;
    },
    enabled: Boolean(patientId),
  });

  const recordGrowthMutation = useMutation({
    mutationFn: async () => {
      return growthService.recordGrowthMetric(patientId, {
        age_in_months: parseInt(ageMonths, 10) || 0,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        head_circumference_cm: headCircumference ? parseFloat(headCircumference) : undefined,
        developmental_milestones: milestones ? milestones.split(",").map((s) => s.trim()) : [],
        nutritional_status: nutritionalStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growthHistory", patientId] });
      showToast("Growth metrics recorded", "success");
      setShowModal(false);
      setAgeMonths("");
      setWeightKg("");
      setHeightCm("");
      setHeadCircumference("");
      setMilestones("");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to record growth metric", "error");
    },
  });

  const renderGrowthCard = ({ item }: { item: GrowthRecord }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.ageTitle, { color: colors.primary }]}>
            Age: {item.age_in_months} Months
          </Text>
          <Badge
            label={item.nutritional_status || "Normal"}
            variant={item.nutritional_status === "Normal" ? "success" : "warning"}
            size="sm"
          />
        </View>

        <View style={styles.grid}>
          {item.weight_kg ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Weight</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{item.weight_kg} kg</Text>
            </View>
          ) : null}

          {item.height_cm ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Height</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{item.height_cm} cm</Text>
            </View>
          ) : null}

          {item.head_circumference_cm ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Head Circ.</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{item.head_circumference_cm} cm</Text>
            </View>
          ) : null}

          {item.bmi ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>BMI</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{item.bmi} kg/m²</Text>
            </View>
          ) : null}
        </View>

        {item.developmental_milestones && item.developmental_milestones.length > 0 && (
          <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
            🎯 Milestones: {item.developmental_milestones.join(", ")}
          </Text>
        )}
      </Card>
    );
  };

  const records = data?.records || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="WHO Growth Tracker"
        showBack
        subtitle={patientName ? `Patient: ${patientName}` : undefined}
        rightAction={
          <Button
            title="+ Record"
            size="sm"
            onPress={() => setShowModal(true)}
          />
        }
      />

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderGrowthCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No growth entries recorded"
            description="Track weight, height and developmental milestones over time."
            actionTitle="+ Add Growth Metric"
            onAction={() => setShowModal(true)}
          />
        }
      />

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Record Child Growth Metrics"
        footer={
          <Button
            title="Save Growth Entry"
            onPress={() => recordGrowthMutation.mutate()}
            isLoading={recordGrowthMutation.isPending}
            disabled={!ageMonths}
          />
        }
      >
        <Input
          label="Child Age (in Months) *"
          placeholder="e.g. 6, 12, 24"
          keyboardType="numeric"
          value={ageMonths}
          onChangeText={setAgeMonths}
        />

        <View style={styles.row}>
          <Input
            label="Weight (kg)"
            placeholder="7.5"
            keyboardType="numeric"
            value={weightKg}
            onChangeText={setWeightKg}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Height (cm)"
            placeholder="68"
            keyboardType="numeric"
            value={heightCm}
            onChangeText={setHeightCm}
            containerStyle={styles.halfInput}
          />
        </View>

        <Input
          label="Head Circumference (cm)"
          placeholder="42"
          keyboardType="numeric"
          value={headCircumference}
          onChangeText={setHeadCircumference}
        />

        <Input
          label="Developmental Milestones Achieved"
          placeholder="e.g. Sitting without support, Babbling words"
          value={milestones}
          onChangeText={setMilestones}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    marginBottom: Spacing.md,
  },
  ageTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCell: {
    width: "48%",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  cellLabel: {
    fontSize: Typography.sizes.xs,
  },
  cellVal: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  milestoneText: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
});
