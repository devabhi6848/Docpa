import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "../../constants/layout";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "sm",
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getVariantColors = (): { bg: string; text: string } => {
    switch (variant) {
      case "success":
        return { bg: colors.successLight, text: colors.success };
      case "warning":
        return { bg: colors.warningLight, text: colors.warning };
      case "danger":
        return { bg: colors.dangerLight, text: colors.danger };
      case "info":
        return { bg: colors.infoLight, text: colors.info };
      case "neutral":
        return { bg: colors.surfaceSubtle, text: colors.textSecondary };
      case "primary":
      default:
        return { bg: colors.primaryLight, text: colors.primary };
    }
  };

  const { bg, text } = getVariantColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: size === "sm" ? 3 : 6,
          paddingHorizontal: size === "sm" ? Spacing.sm : Spacing.md,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: size === "sm" ? Typography.sizes.xs : Typography.sizes.sm,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: BorderRadius.round,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: Typography.weights.semibold,
    textTransform: "capitalize",
  },
});
