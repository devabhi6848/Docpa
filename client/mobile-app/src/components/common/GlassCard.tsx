import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, shadows } from '../../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: 'cyan' | 'purple' | 'none';
  variant?: 'default' | 'subtle' | 'highlight';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  glow = 'none',
  variant = 'default',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.surfaceHighlight;
      case 'subtle':
        return colors.surfaceSubtle;
      default:
        return colors.surfaceCard;
    }
  };

  const getGlowStyle = () => {
    if (glow === 'cyan') return shadows.glowCyan;
    if (glow === 'purple') return shadows.glowPurple;
    return shadows.card;
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor() },
        getGlowStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
});
