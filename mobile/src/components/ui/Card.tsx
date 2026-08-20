import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { BorderRadius, Shadows, Spacing } from "../../constants/layout";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: "default" | "outlined" | "flat";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
}) => {
  const { colors, isDark } = useTheme();

  const cardStyles: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(variant === "default" && !isDark ? Shadows.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[cardStyles, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyles, style]}>{children}</View>;
};
