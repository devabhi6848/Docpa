import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useUIStore } from "../../store/uiStore";
import { useTheme } from "../../hooks/useTheme";
import { BorderRadius, Shadows, Spacing, Typography } from "../../constants/layout";

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const hideToast = useUIStore((state) => state.hideToast);
  const { colors } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => {
        const getBg = () => {
          switch (toast.type) {
            case "success":
              return colors.success;
            case "error":
              return colors.danger;
            case "warning":
              return colors.warning;
            case "info":
            default:
              return colors.primary;
          }
        };

        return (
          <TouchableOpacity
            key={toast.id}
            activeOpacity={0.9}
            onPress={() => hideToast(toast.id)}
            style={[styles.toast, { backgroundColor: getBg() }, Shadows.md]}
          >
            <Text style={styles.text}>{toast.message}</Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  text: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
