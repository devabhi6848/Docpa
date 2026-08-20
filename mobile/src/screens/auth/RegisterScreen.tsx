import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { authService } from "../../services/auth.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";
import { UserRole } from "../../types/auth";

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

const ROLES: Array<{ label: string; value: UserRole; icon: string }> = [
  { label: "Doctor", value: "doctor", icon: "👨‍⚕️" },
  { label: "Clinic Admin", value: "clinic_admin", icon: "🏥" },
  { label: "Receptionist", value: "receptionist", icon: "📋" },
  { label: "Nurse", value: "nurse", icon: "🩺" },
];

export const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<RegisterNavProp>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const showToast = useUIStore((state) => state.showToast);

  const [role, setRole] = useState<UserRole>("doctor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [consultationFee, setConsultationFee] = useState("500");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      showToast("Please enter your name", "warning");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      showToast("Please enter email or phone number", "warning");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim(),
        role,
        clinic_name: clinicName.trim() || undefined,
        specialization: specialization.trim() || undefined,
        registration_number: registrationNumber.trim() || undefined,
        consultation_fee: consultationFee ? parseInt(consultationFee, 10) : undefined,
      });

      const { user, tokens, activeClinic } = res.data;
      await setAuth(user, tokens, activeClinic);
      showToast("Practice account registered successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Docpa Account</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Join the unified clinical management platform
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Role Picker */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Your Role</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((r) => {
                const isSelected = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.roleIcon}>{r.icon}</Text>
                    <Text
                      style={[
                        styles.roleLabel,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* General Credentials */}
            <Input
              label="Full Name *"
              placeholder="Dr. Rajesh Sharma"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email Address"
              placeholder="rajesh@docpa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="10-Digit Mobile Number"
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <Input
              label="Password *"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            {/* Doctor / Clinic specific fields */}
            {(role === "doctor" || role === "clinic_admin") && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  Practice Information
                </Text>

                <Input
                  label="Primary Clinic Name"
                  placeholder="e.g. CareWell Multispeciality Clinic"
                  value={clinicName}
                  onChangeText={setClinicName}
                />

                {role === "doctor" && (
                  <>
                    <Input
                      label="Specialization"
                      placeholder="e.g. General Physician, Pediatrician, Cardiologist"
                      value={specialization}
                      onChangeText={setSpecialization}
                    />

                    <Input
                      label="Medical Registration / Council Number"
                      placeholder="e.g. MCI-2018-84729"
                      value={registrationNumber}
                      onChangeText={setRegistrationNumber}
                    />

                    <Input
                      label="Consultation Fee (₹)"
                      placeholder="500"
                      keyboardType="numeric"
                      value={consultationFee}
                      onChangeText={setConsultationFee}
                    />
                  </>
                )}
              </>
            )}

            <Button
              title="Register & Get Started"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.sm }}>
                Already registered?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "bold",
                    fontSize: Typography.sizes.sm,
                    marginLeft: 6,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: 4,
  },
  card: {
    padding: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  roleCard: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
});
