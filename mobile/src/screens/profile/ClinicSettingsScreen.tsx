import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { clinicService } from "../../services/clinic.service";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Spacing, Typography } from "../../constants/layout";

export const ClinicSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const setActiveClinic = useAuthStore((state) => state.setActiveClinic);
  const showToast = useUIStore((state) => state.showToast);
  const queryClient = useQueryClient();

  const [name, setName] = useState(activeClinic?.name || "");
  const [tagline, setTagline] = useState(activeClinic?.tagline || "");
  const [phone, setPhone] = useState(activeClinic?.phone || "");
  const [email, setEmail] = useState(activeClinic?.email || "");
  const [consultationFee, setConsultationFee] = useState(
    activeClinic?.consultation_fee?.toString() || "500"
  );
  const [followUpFee, setFollowUpFee] = useState(
    activeClinic?.follow_up_fee?.toString() || "300"
  );
  const [tokenPrefix, setTokenPrefix] = useState(activeClinic?.token_prefix || "T");
  const [footerText, setFooterText] = useState(
    activeClinic?.letterhead_settings?.footer_text || "Valid for medical record."
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!activeClinic) return;
      return clinicService.updateClinic(activeClinic._id, {
        name: name.trim(),
        tagline: tagline.trim(),
        phone: phone.trim(),
        email: email.trim(),
        consultation_fee: parseInt(consultationFee, 10) || 500,
        follow_up_fee: parseInt(followUpFee, 10) || 300,
        token_prefix: tokenPrefix.trim().toUpperCase(),
        letterhead_settings: {
          ...activeClinic.letterhead_settings,
          footer_text: footerText.trim(),
          show_header: true,
          show_qr_code: true,
          paper_size: "A4",
          header_title: name.trim(),
          header_subtitle: tagline.trim(),
          logo_url: "",
          header_space_mm: 0,
        },
      });
    },
    onSuccess: (res) => {
      if (res?.data?.clinic) {
        setActiveClinic(res.data.clinic);
      }
      showToast("Clinic settings updated", "success");
      navigation.goBack();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update clinic", "error");
    },
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Clinic Settings" showBack subtitle="Practice Configuration" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Clinic Profile</Text>

          <Input
            label="Clinic Name *"
            placeholder="e.g. Docpa Multispeciality Clinic"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Tagline / Header Description"
            placeholder="e.g. Excellence in Healthcare"
            value={tagline}
            onChangeText={setTagline}
          />

          <Input
            label="Clinic Official Phone"
            placeholder="e.g. 022-28479201"
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label="Clinic Contact Email"
            placeholder="contact@clinic.com"
            value={email}
            onChangeText={setEmail}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee & Token Parameters</Text>

          <View style={styles.row}>
            <Input
              label="Consultation Fee (₹)"
              placeholder="500"
              keyboardType="numeric"
              value={consultationFee}
              onChangeText={setConsultationFee}
              containerStyle={styles.halfInput}
            />
            <Input
              label="Follow-Up Fee (₹)"
              placeholder="300"
              keyboardType="numeric"
              value={followUpFee}
              onChangeText={setFollowUpFee}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="OPD Token Prefix"
            placeholder="T"
            maxLength={4}
            value={tokenPrefix}
            onChangeText={setTokenPrefix}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Digital Letterhead Footer</Text>

          <Input
            label="Rx Letterhead Footer Message"
            placeholder="e.g. Valid for medical record."
            value={footerText}
            onChangeText={setFooterText}
            multiline
          />
        </Card>

        <Button
          title="Save Clinic Settings"
          onPress={() => updateMutation.mutate()}
          isLoading={updateMutation.isPending}
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
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
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
