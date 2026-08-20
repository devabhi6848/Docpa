import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Spacing, Typography } from "../../constants/layout";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong while loading data.",
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
        <Text style={{ color: colors.danger, fontSize: 28, fontWeight: "bold" }}>!</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Data Load Error</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  message: {
    fontSize: Typography.sizes.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: Spacing.lg,
  },
});
