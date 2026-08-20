import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { usePatientDetail } from "../../hooks/usePatients";
import { usePatientPrescriptions } from "../../hooks/usePrescriptions";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { VitalsInputModal } from "../../components/shared/VitalsInputModal";
import { Prescription } from "../../types/prescription";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type PatientDetailRouteProp = RouteProp<RootStackParamList, "PatientDetail">;

export const PatientDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<PatientDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { patientId } = route.params;

  const [showVitalsModal, setShowVitalsModal] = useState(false);

  const { data: patient, isLoading } = usePatientDetail(patientId);
  const { data: prescriptions = [] } = usePatientPrescriptions(patientId);

  if (isLoading || !patient) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Patient Profile" showBack />
        <View style={{ padding: Spacing.lg }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} style={{ marginTop: Spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Patient Profile" showBack subtitle={`UHID: ${patient.uhid}`} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.bigAvatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.bigInitial, { color: colors.primary }]}>
                {patient.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.patientName, { color: colors.text }]}>{patient.name}</Text>
              <Text style={[styles.patientSub, { color: colors.textSecondary }]}>
                📱 {patient.phone}
              </Text>
              <Text style={[styles.patientMeta, { color: colors.textMuted }]}>
                {patient.gender.toUpperCase()} • {patient.age_years ? `${patient.age_years} yrs` : ""}
              </Text>
            </View>
            {patient.blood_group && (
              <Badge label={patient.blood_group} variant="danger" size="md" />
            )}
          </View>

          {/* Quick Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              onPress={() => setShowVitalsModal(true)}
              style={[styles.actionTile, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={styles.tileIcon}>🩺</Text>
              <Text style={[styles.tileLabel, { color: colors.text }]}>Record Vitals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("PrescriptionCreate", { patientId: patient._id })}
              style={[styles.actionTile, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={styles.tileIcon}>📝</Text>
              <Text style={[styles.tileLabel, { color: colors.text }]}>New Rx</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("VaccineSchedule", { patientId: patient._id, patientName: patient.name })}
              style={[styles.actionTile, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={styles.tileIcon}>💉</Text>
              <Text style={[styles.tileLabel, { color: colors.text }]}>Vaccines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("GrowthTracker", { patientId: patient._id, patientName: patient.name })}
              style={[styles.actionTile, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={styles.tileIcon}>📈</Text>
              <Text style={[styles.tileLabel, { color: colors.text }]}>Growth Chart</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Medical History & Allergies */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Clinical Summary</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Allergies:</Text>
            <Text style={[styles.infoVal, { color: colors.danger }]}>
              {patient.allergies && patient.allergies.length > 0
                ? patient.allergies.join(", ")
                : "No known drug allergies (NKDA)"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Chronic Conditions:</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>
              {patient.chronic_conditions && patient.chronic_conditions.length > 0
                ? patient.chronic_conditions.join(", ")
                : "None recorded"}
            </Text>
          </View>

          {patient.guardian_name ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Guardian:</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>
                {patient.guardian_name} ({patient.guardian_relationship || "Guardian"})
              </Text>
            </View>
          ) : null}

          <Button
            title="View Vitals Timeline Graph"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate("VitalsTimeline", { patientId: patient._id, patientName: patient.name })}
            style={{ marginTop: Spacing.md }}
          />
        </Card>

        {/* Past Prescriptions Timeline */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Past Prescriptions ({prescriptions.length})
          </Text>

          {prescriptions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No past prescriptions recorded for this patient yet.
            </Text>
          ) : (
            prescriptions.map((rx: Prescription) => (
              <TouchableOpacity
                key={rx._id}
                onPress={() => navigation.navigate("PrescriptionDetail", { prescriptionId: rx._id })}
                style={[styles.rxItem, { borderBottomColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rxNum, { color: colors.primary }]}>
                    Rx #{rx.prescription_number}
                  </Text>
                  <Text style={[styles.rxDiagnosis, { color: colors.text }]}>
                    Diagnosis: {rx.diagnosis?.join(", ") || "General Consultation"}
                  </Text>
                  <Text style={[styles.rxDate, { color: colors.textMuted }]}>
                    {new Date(rx.createdAt || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Vitals Recording Modal */}
      <VitalsInputModal
        visible={showVitalsModal}
        patientId={patient._id}
        patientName={patient.name}
        onClose={() => setShowVitalsModal(false)}
      />
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
  profileCard: {
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bigAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  bigInitial: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  patientSub: {
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  patientMeta: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionTile: {
    width: "23%",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  tileIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs + 2,
  },
  infoLabel: {
    fontSize: Typography.sizes.sm,
    width: 140,
    fontWeight: "500",
  },
  infoVal: {
    fontSize: Typography.sizes.sm,
    flex: 1,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    fontStyle: "italic",
    paddingVertical: Spacing.sm,
  },
  rxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  rxNum: {
    fontSize: Typography.sizes.sm,
    fontWeight: "bold",
  },
  rxDiagnosis: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 2,
  },
  rxDate: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
});
