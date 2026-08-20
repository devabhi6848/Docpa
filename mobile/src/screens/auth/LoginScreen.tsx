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
import { clinicService } from "../../services/clinic.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<LoginNavigationProp>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMyClinics = useAuthStore((state) => state.setMyClinics);
  const showToast = useUIStore((state) => state.showToast);

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showToast("Please enter both email/phone and password", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      const { user, tokens, activeClinic } = res.data;
      await setAuth(user, tokens, activeClinic);

      // Fetch user's clinics in background
      clinicService
        .getMyClinics()
        .then((clinicRes) => {
          if (clinicRes.data?.clinics) {
            setMyClinics(clinicRes.data.clinics);
          }
        })
        .catch(() => {});

      showToast(`Welcome back, ${user.name || "Doctor"}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Invalid credentials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      showToast("Please enter your mobile phone or email", "warning");
      return;
    }

    const isEmail = identifier.includes("@");
    const type = isEmail ? "email" : "phone";

    setIsLoading(true);
    try {
      await authService.sendOtp({ identifier: identifier.trim(), type });
      showToast("Verification OTP sent successfully", "success");
      navigation.navigate("Otp", { identifier: identifier.trim(), type });
    } catch (err: any) {
      showToast(err.message || "Failed to send OTP", "error");
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
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoSymbol}>⚕️</Text>
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Docpa</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
              Smart OPD & Clinical Practice Management
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Mode Switcher */}
            <View style={[styles.tabSwitcher, { backgroundColor: colors.surfaceSubtle }]}>
              <TouchableOpacity
                onPress={() => setAuthMode("password")}
                style={[
                  styles.tabBtn,
                  authMode === "password" && { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: authMode === "password" ? colors.primary : colors.textMuted,
                      fontWeight: authMode === "password" ? "bold" : "500",
                    },
                  ]}
                >
                  Password Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAuthMode("otp")}
                style={[
                  styles.tabBtn,
                  authMode === "otp" && { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: authMode === "otp" ? colors.primary : colors.textMuted,
                      fontWeight: authMode === "otp" ? "bold" : "500",
                    },
                  ]}
                >
                  Mobile / OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <Input
              label="Email or Phone Number"
              placeholder="e.g. doctor@clinic.com or 9876543210"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {authMode === "password" && (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
            )}

            <Button
              title={authMode === "password" ? "Sign In" : "Send Verification OTP"}
              onPress={authMode === "password" ? handlePasswordLogin : handleSendOtp}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.sm }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "bold",
                    fontSize: Typography.sizes.sm,
                    marginLeft: 6,
                  }}
                >
                  Register Practice
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logoSymbol: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.heavy,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    padding: Spacing.xl,
  },
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
});
