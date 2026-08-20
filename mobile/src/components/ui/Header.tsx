import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { Spacing, Typography } from "../../constants/layout";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showClinicSwitch?: boolean;
  onClinicSwitchPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showClinicSwitch = false,
  onClinicSwitchPress,
  rightAction,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const activeClinic = useAuthStore((state) => state.activeClinic);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "bold" }}>‹</Text>
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>

          {showClinicSwitch && activeClinic && (
            <TouchableOpacity
              onPress={onClinicSwitchPress}
              style={styles.clinicSwitch}
              activeOpacity={0.7}
            >
              <Text style={[styles.clinicName, { color: colors.primary }]} numberOfLines={1}>
                📍 {activeClinic.name} ▾
              </Text>
            </TouchableOpacity>
          )}

          {subtitle && !showClinicSwitch && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backBtn: {
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  clinicSwitch: {
    marginTop: 2,
  },
  clinicName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  rightAction: {
    marginLeft: Spacing.md,
  },
});
