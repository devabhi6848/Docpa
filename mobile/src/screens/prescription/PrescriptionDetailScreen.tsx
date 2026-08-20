import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { usePrescriptionDetail } from "../../hooks/usePrescriptions";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type RxDetailRouteProp = RouteProp<RootStackParamList, "PrescriptionDetail">;

export const PrescriptionDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RxDetailRouteProp>();
  const { prescriptionId } = route.params;

  const { data: prescription, isLoading } = usePrescriptionDetail(prescriptionId);

  if (isLoading || !prescription) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Prescription Details" showBack />
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={200} borderRadius={16} />
          <Skeleton height={150} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const clinic = prescription.clinic_id;
  const doctor = prescription.doctor_id;
  const patient = prescription.patient_id;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title={`Rx #${prescription.prescription_number}`}
        showBack
        subtitle="Medical Prescription"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Letterhead Header */}
        <Card style={styles.letterheadCard}>
          <View style={styles.clinicHeader}>
            <Text style={[styles.clinicTitle, { color: colors.primary }]}>
              {clinic?.name || "Docpa Clinic"}
            </Text>
            {clinic?.tagline ? (
              <Text style={[styles.clinicTagline, { color: colors.textMuted }]}>
                {clinic.tagline}
              </Text>
            ) : null}
            {clinic?.phone ? (
              <Text style={[styles.clinicContact, { color: colors.textSecondary }]}>
                📞 {clinic.phone} • {clinic.email || ""}
              </Text>
            ) : null}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Doctor & Patient Row */}
          <View style={styles.partiesRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.partyLabel, { color: colors.textMuted }]}>DOCTOR</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>
                {doctor?.name || "Consultant Physician"}
              </Text>
              <Text style={[styles.partyMeta, { color: colors.textSecondary }]}>
                {doctor?.role?.toUpperCase() || "DOCTOR"}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={[styles.partyLabel, { color: colors.textMuted }]}>PATIENT</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>
                {patient?.name || "Patient"}
              </Text>
              <Text style={[styles.partyMeta, { color: colors.textSecondary }]}>
                UHID: {patient?.uhid || "N/A"} • {patient?.gender?.toUpperCase() || ""}
              </Text>
            </View>
          </View>
        </Card>

        {/* Clinical Summary */}
        <Card style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Diagnosis & Findings</Text>
            <Badge label={prescription.status.toUpperCase()} variant="success" size="sm" />
          </View>

          {prescription.chief_complaints?.length > 0 && (
            <View style={styles.findingRow}>
              <Text style={[styles.findingLabel, { color: colors.textSecondary }]}>
                Chief Complaints:
              </Text>
              <Text style={[styles.findingVal, { color: colors.text }]}>
                {prescription.chief_complaints.join(", ")}
              </Text>
            </View>
          )}

          {prescription.diagnosis?.length > 0 && (
            <View style={styles.findingRow}>
              <Text style={[styles.findingLabel, { color: colors.textSecondary }]}>Diagnosis:</Text>
              <Text style={[styles.findingVal, { color: colors.primary, fontWeight: "bold" }]}>
                {prescription.diagnosis.join(", ")}
              </Text>
            </View>
          )}
        </Card>

        {/* Rx Medicines */}
        <Card style={styles.card}>
          <Text style={[styles.rxSymbol, { color: colors.primary }]}>℞ Medicines Prescribed</Text>

          {prescription.medicines?.map((med: any, index: number) => (
            <View
              key={index}
              style={[
                styles.medicineBlock,
                { borderBottomColor: colors.border },
                index === prescription.medicines.length - 1 ? { borderBottomWidth: 0 } : undefined,
              ]}
            >
              <View style={styles.medTopRow}>
                <Text style={[styles.medName, { color: colors.text }]}>
                  {index + 1}. {med.name} ({med.dosage_form || "Tab"})
                </Text>
                <Badge label={`${med.duration_days} Days`} variant="neutral" size="sm" />
              </View>

              <Text style={[styles.medDose, { color: colors.primary }]}>
                Dose: {med.dose || "1 Tab"} • Frequency: {med.frequency} • {med.timing}
              </Text>

              {med.instructions ? (
                <Text style={[styles.medInstructions, { color: colors.textMuted }]}>
                  Instructions: {med.instructions}
                </Text>
              ) : null}
            </View>
          ))}
        </Card>

        {/* Orders, Advice & Follow Up */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General Advice & Orders</Text>

          {prescription.investigations?.length > 0 && (
            <View style={styles.adviceBlock}>
              <Text style={[styles.adviceHeader, { color: colors.textSecondary }]}>
                Recommended Investigations / Lab Tests:
              </Text>
              <Text style={[styles.adviceBody, { color: colors.text }]}>
                {prescription.investigations.join(", ")}
              </Text>
            </View>
          )}

          {prescription.general_advice ? (
            <View style={styles.adviceBlock}>
              <Text style={[styles.adviceHeader, { color: colors.textSecondary }]}>Advice:</Text>
              <Text style={[styles.adviceBody, { color: colors.text }]}>
                {prescription.general_advice}
              </Text>
            </View>
          ) : null}

          {prescription.follow_up_date && (
            <View style={[styles.followUpBox, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.followUpText, { color: colors.primary }]}>
                🗓️ Recommended Follow-up:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {new Date(prescription.follow_up_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </Text>
            </View>
          )}
        </Card>
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
  letterheadCard: {
    marginBottom: Spacing.md,
  },
  clinicHeader: {
    alignItems: "center",
  },
  clinicTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  clinicTagline: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  clinicContact: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partyLabel: {
    fontSize: Typography.sizes.xs - 2,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  partyName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: "bold",
    marginTop: 2,
  },
  partyMeta: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  findingRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  findingLabel: {
    width: 130,
    fontSize: Typography.sizes.sm,
  },
  findingVal: {
    flex: 1,
    fontSize: Typography.sizes.sm,
  },
  rxSymbol: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    marginBottom: Spacing.md,
  },
  medicineBlock: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  medTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: "bold",
    flex: 1,
  },
  medDose: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
    marginTop: 4,
  },
  medInstructions: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  adviceBlock: {
    marginBottom: Spacing.sm,
  },
  adviceHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
    marginBottom: 2,
  },
  adviceBody: {
    fontSize: Typography.sizes.sm,
  },
  followUpBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  followUpText: {
    fontSize: Typography.sizes.sm,
  },
});
