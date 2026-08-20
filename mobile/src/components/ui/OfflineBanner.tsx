import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUIStore } from "../../store/uiStore";
import { Spacing, Typography } from "../../constants/layout";

export const OfflineBanner: React.FC = () => {
  const isOffline = useUIStore((state) => state.isOffline);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ You are currently offline. Showing cached records.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#DC2626",
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
});
