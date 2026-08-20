import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useRecordVitals } from "../../hooks/usePatients";
import { Spacing, Typography } from "../../constants/layout";
import { useTheme } from "../../hooks/useTheme";

interface VitalsInputModalProps {
  visible: boolean;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  onClose: () => void;
}

export const VitalsInputModal: React.FC<VitalsInputModalProps> = ({
  visible,
  patientId,
  patientName,
  appointmentId,
  onClose,
}) => {
  const { colors } = useTheme();
  const recordVitalsMutation = useRecordVitals();

  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [temperatureF, setTemperatureF] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [rbs, setRbs] = useState("");
  const [notes, setNotes] = useState("");

  const calculateBmi = (): string => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return "";
  };

  const handleSave = () => {
    recordVitalsMutation.mutate(
      {
        patientId,
        vitals: {
          bp_systolic: bpSystolic ? parseInt(bpSystolic, 10) : undefined,
          bp_diastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : undefined,
          pulse_rate: pulseRate ? parseInt(pulseRate, 10) : undefined,
          temperature_f: temperatureF ? parseFloat(temperatureF) : undefined,
          spo2_percent: spo2 ? parseInt(spo2, 10) : undefined,
          weight_kg: weightKg ? parseFloat(weightKg) : undefined,
          height_cm: heightCm ? parseFloat(heightCm) : undefined,
          head_circumference_cm: headCircumference ? parseFloat(headCircumference) : undefined,
          rbs_mg_dl: rbs ? parseInt(rbs, 10) : undefined,
          notes,
          appointment_id: appointmentId,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const bmi = calculateBmi();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={patientName ? `Record Vitals: ${patientName}` : "Record Patient Vitals"}
      footer={
        <Button
          title="Save Vitals"
          onPress={handleSave}
          isLoading={recordVitalsMutation.isPending}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Blood Pressure Row */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Cardiovascular & Vitals
        </Text>
        <View style={styles.row}>
          <Input
            label="BP Systolic (mmHg)"
            placeholder="120"
            keyboardType="numeric"
            value={bpSystolic}
            onChangeText={setBpSystolic}
            containerStyle={styles.halfInput}
          />
          <Input
            label="BP Diastolic (mmHg)"
            placeholder="80"
            keyboardType="numeric"
            value={bpDiastolic}
            onChangeText={setBpDiastolic}
            containerStyle={styles.halfInput}
          />
        </View>

        <View style={styles.row}>
          <Input
            label="Pulse Rate (bpm)"
            placeholder="72"
            keyboardType="numeric"
            value={pulseRate}
            onChangeText={setPulseRate}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Temp (°F)"
            placeholder="98.6"
            keyboardType="numeric"
            value={temperatureF}
            onChangeText={setTemperatureF}
            containerStyle={styles.halfInput}
          />
        </View>

        <View style={styles.row}>
          <Input
            label="SpO2 (%)"
            placeholder="98"
            keyboardType="numeric"
            value={spo2}
            onChangeText={setSpo2}
            containerStyle={styles.halfInput}
          />
          <Input
            label="RBS (mg/dL)"
            placeholder="110"
            keyboardType="numeric"
            value={rbs}
            onChangeText={setRbs}
            containerStyle={styles.halfInput}
          />
        </View>

        {/* Physical Growth Row */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Anthropometry & BMI
        </Text>
        <View style={styles.row}>
          <Input
            label="Weight (kg)"
            placeholder="65"
            keyboardType="numeric"
            value={weightKg}
            onChangeText={setWeightKg}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Height (cm)"
            placeholder="170"
            keyboardType="numeric"
            value={heightCm}
            onChangeText={setHeightCm}
            containerStyle={styles.halfInput}
          />
        </View>

        {bmi ? (
          <View style={[styles.bmiBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.bmiText, { color: colors.primary }]}>
              Calculated BMI: <Text style={{ fontWeight: "bold" }}>{bmi}</Text> kg/m²
            </Text>
          </View>
        ) : null}

        <Input
          label="Head Circumference (cm - for pediatrics)"
          placeholder="35"
          keyboardType="numeric"
          value={headCircumference}
          onChangeText={setHeadCircumference}
        />

        <Input
          label="Vitals Observation Notes"
          placeholder="e.g. Patient rested 5 mins before BP measurement"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  bmiBox: {
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  bmiText: {
    fontSize: Typography.sizes.sm,
  },
});
