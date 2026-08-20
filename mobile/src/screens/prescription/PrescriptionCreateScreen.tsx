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
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useIssuePrescription, useDoctorTemplates } from "../../hooks/usePrescriptions";
import { usePatientDetail } from "../../hooks/usePatients";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { MedicineSelectorModal } from "../../components/shared/MedicineSelectorModal";
import { PrescribedMedicine } from "../../types/prescription";
import { RxTemplate } from "../../types/template";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type RxCreateRouteProp = RouteProp<RootStackParamList, "PrescriptionCreate">;

export const PrescriptionCreateScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RxCreateRouteProp>();
  const navigation = useNavigation<any>();
  const { token, patientId: passedPatientId } = route.params || {};

  const activeClinic = useAuthStore((state) => state.activeClinic);
  const showToast = useUIStore((state) => state.showToast);

  const patientId = token?.patient_id?._id || passedPatientId || "";
  const { data: patient } = usePatientDetail(patientId);
  const { data: templates = [] } = useDoctorTemplates();

  const [chiefComplaints, setChiefComplaints] = useState(token?.chief_complaint || "");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [investigations, setInvestigations] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("Take medicines on time. Stay hydrated and rest.");
  const [followUpDays, setFollowUpDays] = useState("5");
  const [showMedModal, setShowMedModal] = useState(false);

  const issueRxMutation = useIssuePrescription();

  const handleApplyTemplate = (tmpl: RxTemplate) => {
    if (tmpl.chief_complaints?.length) setChiefComplaints(tmpl.chief_complaints.join(", "));
    if (tmpl.diagnosis?.length) setDiagnosis(tmpl.diagnosis.join(", "));
    if (tmpl.medicines?.length) setMedicines(tmpl.medicines);
    if (tmpl.investigations?.length) setInvestigations(tmpl.investigations.join(", "));
    if (tmpl.advice) setGeneralAdvice(tmpl.advice);
    showToast(`Applied template: ${tmpl.title}`, "info");
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIssueRx = () => {
    if (!activeClinic) {
      showToast("Please select an active clinic first", "warning");
      return;
    }
    if (!patientId) {
      showToast("Patient ID is missing", "warning");
      return;
    }
    if (medicines.length === 0) {
      showToast("Please add at least one medicine to the prescription", "warning");
      return;
    }

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + (parseInt(followUpDays, 10) || 5));

    issueRxMutation.mutate(
      {
        clinic_id: activeClinic._id,
        patient_id: patientId,
        appointment_id: token?._id,
        chief_complaints: chiefComplaints ? chiefComplaints.split(",").map((s) => s.trim()) : [],
        diagnosis: diagnosis ? diagnosis.split(",").map((s) => s.trim()) : ["Clinical Assessment"],
        clinical_notes: clinicalNotes.trim() || undefined,
        medicines,
        investigations: investigations ? investigations.split(",").map((s) => s.trim()) : [],
        general_advice: generalAdvice.trim(),
        follow_up_date: followUpDate.toISOString(),
      },
      {
        onSuccess: (res) => {
          const rxId = res.data?.prescription?._id;
          if (rxId) {
            navigation.replace("PrescriptionDetail", { prescriptionId: rxId });
          } else {
            navigation.goBack();
          }
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Smart Rx Studio"
        showBack
        subtitle={patient ? `Patient: ${patient.name} (${patient.uhid})` : undefined}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Template Quick Loader */}
        {templates.length > 0 && (
          <View style={styles.templateSection}>
            <Text style={[styles.templateHeader, { color: colors.textSecondary }]}>
              ⚡ Quick Rx Templates
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
              {templates.map((tmpl: RxTemplate) => (
                <TouchableOpacity
                  key={tmpl._id}
                  onPress={() => handleApplyTemplate(tmpl)}
                  style={[
                    styles.templateChip,
                    { backgroundColor: colors.surface, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.templateChipText, { color: colors.primary }]}>
                    + {tmpl.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Complaints & Diagnosis */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Clinical Findings</Text>

          <Input
            label="Chief Complaints"
            placeholder="e.g. Fever for 3 days, Sore Throat, Cough"
            value={chiefComplaints}
            onChangeText={setChiefComplaints}
          />

          <Input
            label="Provisional Diagnosis *"
            placeholder="e.g. Acute Viral URI, Pharyngitis"
            value={diagnosis}
            onChangeText={setDiagnosis}
          />

          <Input
            label="Doctor Clinical Notes (Internal)"
            placeholder="e.g. Chest clear on auscultation, throat congested"
            value={clinicalNotes}
            onChangeText={setClinicalNotes}
            multiline
          />
        </Card>

        {/* Prescribed Medicines List */}
        <Card style={styles.card}>
          <View style={styles.rxHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Prescribed Medicines ({medicines.length})
            </Text>
            <Button
              title="+ Add Drug"
              size="sm"
              onPress={() => setShowMedModal(true)}
            />
          </View>

          {medicines.length === 0 ? (
            <View style={styles.emptyDrugs}>
              <Text style={{ color: colors.textMuted }}>No medicines added to Rx yet.</Text>
            </View>
          ) : (
            medicines.map((med, index) => (
              <View
                key={index}
                style={[
                  styles.drugItem,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drugName, { color: colors.text }]}>
                    {index + 1}. {med.name} ({med.dosage_form || "Tab"})
                  </Text>
                  <Text style={[styles.drugDetails, { color: colors.primary }]}>
                    Dose: {med.dose || "1 Tab"} • Frequency: {med.frequency} • {med.timing}
                  </Text>
                  <Text style={[styles.drugDuration, { color: colors.textMuted }]}>
                    Duration: {med.duration_days} Days
                    {med.instructions ? ` • Instructions: ${med.instructions}` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMedicine(index)}
                  style={styles.removeBtn}
                >
                  <Text style={{ color: colors.danger, fontWeight: "bold" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        {/* Investigations, Advice & Follow-up */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Orders & Advice</Text>

          <Input
            label="Lab / Diagnostic Investigations"
            placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray"
            value={investigations}
            onChangeText={setInvestigations}
          />

          <Input
            label="General Advice & Dietary Instructions"
            placeholder="e.g. Drink plenty of warm water, avoid oily foods"
            value={generalAdvice}
            onChangeText={setGeneralAdvice}
            multiline
          />

          <Input
            label="Follow Up In (Days)"
            placeholder="5"
            keyboardType="numeric"
            value={followUpDays}
            onChangeText={setFollowUpDays}
          />
        </Card>

        <Button
          title="Sign & Issue Prescription (Rx)"
          onPress={handleIssueRx}
          isLoading={issueRxMutation.isPending}
          disabled={medicines.length === 0}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>

      {/* Medicine Add Modal */}
      <MedicineSelectorModal
        visible={showMedModal}
        onClose={() => setShowMedModal(false)}
        onAddMedicine={(newMed) => setMedicines((prev) => [...prev, newMed])}
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
  templateSection: {
    marginBottom: Spacing.md,
  },
  templateHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  templatesScroll: {
    flexDirection: "row",
  },
  templateChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  templateChipText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  rxHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  emptyDrugs: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  drugItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  drugName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: "bold",
  },
  drugDetails: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
    marginTop: 2,
  },
  drugDuration: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  removeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  submitBtn: {
    marginBottom: Spacing.xxl,
  },
});
