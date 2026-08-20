import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ClinicSelectorModal } from "../../components/shared/ClinicSelectorModal";
import { Spacing, Typography, BorderRadius } from "../../constants/layout";

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const navigation = useNavigation<ProfileNavProp>();
  const user = useAuthStore((state) => state.user);
  const activeClinic = useAuthStore((state) => state.activeClinic);
  const logout = useAuthStore((state) => state.logout);

  const [showClinicModal, setShowClinicModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to log out of your Docpa account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Account & Practice Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name || "Practitioner"}</Text>
              <Text style={[styles.userContact, { color: colors.textSecondary }]}>
                {user?.email || user?.phone || "No contact info"}
              </Text>
              <Badge
                label={user?.role?.toUpperCase() || "DOCTOR"}
                variant="primary"
                size="sm"
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        </Card>

        {/* Active Clinic Switcher Card */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Active Practice Location</Text>
          <View style={styles.clinicRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clinicName, { color: colors.text }]}>
                {activeClinic?.name || "Default Clinic"}
              </Text>
              <Text style={[styles.clinicLocation, { color: colors.textMuted }]}>
                {activeClinic?.address?.city
                  ? `${activeClinic.address.city}, ${activeClinic.address.state || "India"}`
                  : "Practice Location"}
              </Text>
            </View>
            <Button
              title="Switch"
              variant="outline"
              size="sm"
              onPress={() => setShowClinicModal(true)}
            />
          </View>
        </Card>

        {/* Management & Configuration Links */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Practice Management</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("TemplateManager")}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <Text style={styles.menuIcon}>📝</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Rx Prescription Templates</Text>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ClinicSettings")}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <Text style={styles.menuIcon}>🏥</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Clinic Profile & Letterhead</Text>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("StaffManagement")}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Clinic Staff & Permissions</Text>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("TeleconsultationList")}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
          >
            <Text style={styles.menuIcon}>📞</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Teleconsultation Portal</Text>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Appearance & Theming */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <View style={styles.themeRow}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>Dark Mode</Text>
            <View style={styles.themeChips}>
              {(["light", "dark", "system"] as const).map((mode) => {
                const isSelected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#FFFFFF" : colors.text,
                        fontWeight: "600",
                        textTransform: "capitalize",
                        fontSize: Typography.sizes.xs,
                      }}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out of Docpa"
          variant="danger"
          size="lg"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>

      <ClinicSelectorModal
        visible={showClinicModal}
        onClose={() => setShowClinicModal(false)}
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
  userCard: {
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  userContact: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  clinicRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clinicName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  clinicLocation: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: "600",
    flex: 1,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  themeLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
  },
  themeChips: {
    flexDirection: "row",
  },
  themeChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginLeft: Spacing.xs,
  },
  logoutBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
});
