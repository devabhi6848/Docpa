import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AuthStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { authService } from "../../services/auth.service";
import { clinicService } from "../../services/clinic.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spacing, Typography } from "../../constants/layout";

type OtpRouteProp = RouteProp<AuthStackParamList, "Otp">;

export const OtpScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<OtpRouteProp>();
  const { identifier, type, isRegister, role } = route.params;

  const setAuth = useAuthStore((state) => state.setAuth);
  const setMyClinics = useAuthStore((state) => state.setMyClinics);
  const showToast = useUIStore((state) => state.showToast);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await authService.sendOtp({ identifier, type });
      setTimer(60);
      showToast("A new 6-digit OTP has been sent", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to resend OTP", "error");
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      showToast("Please enter the 6-digit OTP", "warning");
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await authService.registerWithOtp({
          identifier,
          otp,
          type,
          role: (role as any) || "doctor",
          password: password || undefined,
        });
      } else {
        res = await authService.loginWithOtp({
          identifier,
          otp,
          type,
          role: (role as any) || "doctor",
        });
      }

      const { user, tokens, activeClinic } = res.data;
      await setAuth(user, tokens, activeClinic);

      clinicService
        .getMyClinics()
        .then((cRes) => {
          if (cRes.data?.clinics) {
            setMyClinics(cRes.data.clinics);
          }
        })
        .catch(() => {});

      showToast("Logged in successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Invalid or expired OTP", "error");
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
        <View style={styles.content}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Enter Verification Code</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                We sent a 6-digit OTP code to:
              </Text>
              <Text style={[styles.target, { color: colors.primary }]}>{identifier}</Text>
            </View>

            <Input
              label="6-Digit OTP Code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              containerStyle={styles.otpInput}
            />

            {isRegister && (
              <Input
                label="Set Account Password (Optional)"
                placeholder="Minimum 6 characters"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
            )}

            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              isLoading={isLoading}
              style={styles.verifyBtn}
            />

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.sm }}>
                  Resend code in <Text style={{ fontWeight: "bold" }}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: Typography.sizes.sm }}>
                    Resend OTP Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  card: {
    padding: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: 6,
  },
  target: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  otpInput: {
    marginTop: Spacing.sm,
  },
  verifyBtn: {
    marginTop: Spacing.md,
  },
  resendRow: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
});
