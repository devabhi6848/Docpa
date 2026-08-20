import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { usePatientSearch } from "../../hooks/usePatients";
import { useGenerateToken } from "../../hooks/useQueue";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Patient } from "../../types/patient";
import { VisitType, PriorityLevel } from "../../types/queue";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

const VISIT_TYPES: Array<{ label: string; value: VisitType }> = [
  { label: "New Visit", value: "new_visit" },
  { label: "Follow Up", value: "follow_up" },
  { label: "Emergency", value: "emergency" },
  { label: "Report Review", value: "report_review" },
  { label: "Vaccination", value: "vaccination" },
];

const PRIORITIES: Array<{ label: string; value: PriorityLevel; color: string }> = [
  { label: "Normal", value: "normal", color: "#10B981" },
  { label: "Urgent", value: "urgent", color: "#F59E0B" },
  { label: "Emergency", value: "emergency", color: "#EF4444" },
];

export const GenerateTokenScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visitType, setVisitType] = useState<VisitType>("new_visit");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [chiefComplaint, setChiefComplaint] = useState("");

  const { data: patientResults = [], isLoading: isSearching } = usePatientSearch(searchQuery);
  const generateTokenMutation = useGenerateToken();

  const handleGenerate = () => {
    if (!activeClinic) {
      showToast("Please select an active clinic first", "warning");
      return;
    }
    if (!selectedPatient) {
      showToast("Please search and select a patient", "warning");
      return;
    }

    const doctorId = user?.role === "doctor" ? user._id : activeClinic.owner_id;

    generateTokenMutation.mutate(
      {
        clinic_id: activeClinic._id,
        doctor_id: doctorId,
        patient_id: selectedPatient._id,
        visit_type: visitType,
        priority,
        chief_complaint: chiefComplaint.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Generate OPD Token" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Patient Selection */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Select Patient</Text>

          {selectedPatient ? (
            <View style={[styles.selectedPatientBox, { backgroundColor: colors.primaryLight }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.patientName, { color: colors.primary }]}>
                  👤 {selectedPatient.name}
                </Text>
                <Text style={[styles.patientSub, { color: colors.primaryDark }]}>
                  Phone: {selectedPatient.phone} | UHID: {selectedPatient.uhid}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPatient(null)}>
                <Text style={{ color: colors.danger, fontWeight: "bold" }}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Input
                label="Search Patient by Phone, Name or UHID"
                placeholder="Type 10-digit phone or patient name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {searchQuery.length > 0 && patientResults.length > 0 && (
                <View style={[styles.resultsBox, { backgroundColor: colors.surfaceSubtle }]}>
                  {patientResults.map((p: Patient) => (
                    <TouchableOpacity
                      key={p._id}
                      onPress={() => {
                        setSelectedPatient(p);
                        setSearchQuery("");
                      }}
                      style={[styles.resultItem, { borderBottomColor: colors.border }]}
                    >
                      <Text style={[styles.resName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.resMeta, { color: colors.textMuted }]}>
                        📱 {p.phone} • UHID: {p.uhid}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Button
                title="+ Register New Patient"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate("AddPatient")}
                style={{ marginTop: Spacing.xs }}
              />
            </>
          )}
        </Card>

        {/* Step 2: Visit Configuration */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Consultation Details</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Visit Type</Text>
          <View style={styles.chipsRow}>
            {VISIT_TYPES.map((v) => {
              const isSelected = visitType === v.value;
              return (
                <TouchableOpacity
                  key={v.value}
                  onPress={() => setVisitType(v.value)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Priority Status
          </Text>
          <View style={styles.chipsRow}>
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? p.color : colors.surfaceSubtle,
                      borderColor: isSelected ? p.color : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Chief Complaint (Optional)"
            placeholder="e.g. High fever for 3 days, dry cough"
            value={chiefComplaint}
            onChangeText={setChiefComplaint}
            containerStyle={{ marginTop: Spacing.md }}
          />
        </Card>

        <Button
          title="Issue Live Token"
          onPress={handleGenerate}
          isLoading={generateTokenMutation.isPending}
          disabled={!selectedPatient}
          size="lg"
          style={styles.submitBtn}
        />
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
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  selectedPatientBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  patientName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  patientSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  resultsBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    maxHeight: 200,
  },
  resultItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  resName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  resMeta: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
});
