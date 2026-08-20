import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Spacing, Typography } from "../../constants/layout";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  icon,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxl,
  },
  iconWrapper: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textAlign: "center",
  },
  description: {
    fontSize: Typography.sizes.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: Spacing.lg,
  },
});
