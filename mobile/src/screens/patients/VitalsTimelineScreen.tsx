import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { usePatientVitalsTimeline } from "../../hooks/usePatients";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { VitalsInputModal } from "../../components/shared/VitalsInputModal";
import { Vitals } from "../../types/patient";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type VitalsTimelineRouteProp = RouteProp<RootStackParamList, "VitalsTimeline">;

export const VitalsTimelineScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<VitalsTimelineRouteProp>();
  const { patientId, patientName } = route.params;

  const [showModal, setShowModal] = useState(false);
  const { data: timeline = [], isLoading, refetch } = usePatientVitalsTimeline(patientId);

  const getBmiStatus = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", variant: "warning" as const };
    if (bmi <= 24.9) return { label: "Healthy Weight", variant: "success" as const };
    if (bmi <= 29.9) return { label: "Overweight", variant: "warning" as const };
    return { label: "Obese", variant: "danger" as const };
  };

  const renderVitalsCard = ({ item }: { item: Vitals }) => {
    const bmiInfo = getBmiStatus(item.bmi);

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.recordedDate, { color: colors.primary }]}>
            📅 {new Date(item.recorded_at || item.createdAt || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {bmiInfo && (
            <Badge label={bmiInfo.label} variant={bmiInfo.variant} size="sm" />
          )}
        </View>

        {/* Vitals Grid */}
        <View style={styles.grid}>
          {item.bp_systolic && item.bp_diastolic ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Blood Pressure</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.bp_systolic}/{item.bp_diastolic}{" "}
                <Text style={styles.cellUnit}>mmHg</Text>
              </Text>
            </View>
          ) : null}

          {item.pulse_rate ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Pulse Rate</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.pulse_rate} <Text style={styles.cellUnit}>bpm</Text>
              </Text>
            </View>
          ) : null}

          {item.spo2_percent ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Oxygen (SpO2)</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.spo2_percent}%
              </Text>
            </View>
          ) : null}

          {item.temperature_f ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Temperature</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.temperature_f}°F
              </Text>
            </View>
          ) : null}

          {item.weight_kg ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Weight & Height</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.weight_kg}kg {item.height_cm ? `/ ${item.height_cm}cm` : ""}
              </Text>
            </View>
          ) : null}

          {item.bmi ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Body Mass Index</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.bmi} <Text style={styles.cellUnit}>kg/m²</Text>
              </Text>
            </View>
          ) : null}

          {item.rbs_mg_dl ? (
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>Blood Sugar (RBS)</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>
                {item.rbs_mg_dl} <Text style={styles.cellUnit}>mg/dL</Text>
              </Text>
            </View>
          ) : null}
        </View>

        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            💬 Notes: {item.notes}
          </Text>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Vitals Timeline"
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

      {isLoading ? (
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={140} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={timeline}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderVitalsCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No vitals recorded yet"
              description="Record patient vital signs to track health progression over time."
              actionTitle="+ Record First Vitals"
              onAction={() => setShowModal(true)}
            />
          }
        />
      )}

      <VitalsInputModal
        visible={showModal}
        patientId={patientId}
        patientName={patientName}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  recordedDate: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
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
    marginBottom: 2,
  },
  cellVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  cellUnit: {
    fontSize: Typography.sizes.xs,
    fontWeight: "normal",
  },
  notesText: {
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
});
