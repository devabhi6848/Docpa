import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "../../constants/layout";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BorderRadius.md,
      opacity: disabled || isLoading ? 0.6 : 1,
    };

    // Size
    switch (size) {
      case "sm":
        base.paddingVertical = Spacing.xs + 2;
        base.paddingHorizontal = Spacing.md;
        break;
      case "lg":
        base.paddingVertical = Spacing.md + 2;
        base.paddingHorizontal = Spacing.xl;
        break;
      case "md":
      default:
        base.paddingVertical = Spacing.sm + 4;
        base.paddingHorizontal = Spacing.lg;
        break;
    }

    // Variant
    switch (variant) {
      case "secondary":
        base.backgroundColor = colors.surfaceSubtle;
        break;
      case "outline":
        base.backgroundColor = "transparent";
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case "danger":
        base.backgroundColor = colors.danger;
        break;
      case "ghost":
        base.backgroundColor = "transparent";
        break;
      case "primary":
      default:
        base.backgroundColor = colors.primary;
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: Typography.weights.semibold,
      textAlign: "center",
    };

    switch (size) {
      case "sm":
        base.fontSize = Typography.sizes.sm;
        break;
      case "lg":
        base.fontSize = Typography.sizes.lg;
        break;
      case "md":
      default:
        base.fontSize = Typography.sizes.md;
        break;
    }

    switch (variant) {
      case "secondary":
        base.color = colors.text;
        break;
      case "outline":
      case "ghost":
        base.color = colors.primary;
        break;
      case "danger":
      case "primary":
      default:
        base.color = "#FFFFFF";
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[getContainerStyle(), style]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? colors.primary : "#FFFFFF"}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: Spacing.sm } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
