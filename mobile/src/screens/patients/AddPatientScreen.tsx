import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useCreatePatient } from "../../hooks/usePatients";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

const GENDERS = ["male", "female", "other"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] as const;

export const AddPatientScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [ageYears, setAgeYears] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [bloodGroup, setBloodGroup] = useState<typeof BLOOD_GROUPS[number]>("unknown");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("Father");
  const [city, setCity] = useState("");

  const createPatientMutation = useCreatePatient();

  const handleRegister = () => {
    if (!activeClinic) {
      showToast("Please select an active clinic first", "warning");
      return;
    }
    if (!name.trim()) {
      showToast("Patient name is required", "warning");
      return;
    }
    if (!phone.trim() || phone.length !== 10) {
      showToast("Valid 10-digit phone number is required", "warning");
      return;
    }

    createPatientMutation.mutate(
      {
        clinic_id: activeClinic._id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        gender,
        age_years: ageYears ? parseInt(ageYears, 10) : undefined,
        age_months: ageMonths ? parseInt(ageMonths, 10) : undefined,
        blood_group: bloodGroup !== "unknown" ? bloodGroup : undefined,
        allergies: allergies.trim() ? allergies.split(",").map((s) => s.trim()) : [],
        chronic_conditions: chronicConditions.trim()
          ? chronicConditions.split(",").map((s) => s.trim())
          : [],
        guardian_name: guardianName.trim() || undefined,
        guardian_relationship: guardianRelation as any,
        address: city.trim() ? { city: city.trim() } : undefined,
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
      <Header title="Register New Patient" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>

          <Input
            label="Full Patient Name *"
            placeholder="e.g. Ramesh Patel"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="10-Digit Mobile Phone *"
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label="Email Address (Optional)"
            placeholder="patient@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Gender Selector */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Gender *</Text>
          <View style={styles.chipsRow}>
            {GENDERS.map((g) => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? "#FFFFFF" : colors.text,
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Age in Years & Months */}
          <View style={styles.row}>
            <Input
              label="Age (Years)"
              placeholder="32"
              keyboardType="numeric"
              value={ageYears}
              onChangeText={setAgeYears}
              containerStyle={styles.halfInput}
            />
            <Input
              label="Months (Pediatrics)"
              placeholder="6"
              keyboardType="numeric"
              value={ageMonths}
              onChangeText={setAgeMonths}
              containerStyle={styles.halfInput}
            />
          </View>

          {/* Blood Group */}
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Blood Group
          </Text>
          <View style={styles.chipsRow}>
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = bloodGroup === bg;
              return (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setBloodGroup(bg)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.danger : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.danger : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Clinical Notes & Allergies */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Background</Text>

          <Input
            label="Known Drug Allergies"
            placeholder="e.g. Penicillin, Sulfa drugs"
            value={allergies}
            onChangeText={setAllergies}
          />

          <Input
            label="Chronic Medical Conditions"
            placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
            value={chronicConditions}
            onChangeText={setChronicConditions}
          />

          <Input
            label="City / Location"
            placeholder="e.g. Mumbai, Surat, Delhi"
            value={city}
            onChangeText={setCity}
          />
        </Card>

        <Button
          title="Save & Register Patient"
          onPress={handleRegister}
          isLoading={createPatientMutation.isPending}
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
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  submitBtn: {
    marginBottom: Spacing.xxl,
  },
});
