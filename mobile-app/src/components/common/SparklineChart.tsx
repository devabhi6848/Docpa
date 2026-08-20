import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  gradientId?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [10, 20, 15, 30, 25, 40, 35],
  width = Dimensions.get('window').width - 72,
  height = 80,
  color = colors.primary,
  gradientId = 'sparkGradient',
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data, 100);
  const range = max - min || 1;

  // Calculate points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 16) - 8;
    return { x, y };
  });

  // Build Line Path
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    linePath += ` L ${points[i].x} ${points[i].y}`;
  }

  // Build Area Path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Fill Area */}
        <Path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Stroke Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
