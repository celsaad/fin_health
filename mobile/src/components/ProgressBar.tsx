import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
}

export default function ProgressBar({ progress, height = 8, color }: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  const barColor =
    color ??
    (progress > 1
      ? colors.destructive
      : progress > 0.75
        ? colors.amber
        : '#16a34a');

  return (
    <View style={[styles.track, { height, backgroundColor: colors.inputBg }]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedProgress * 100}%`, height, backgroundColor: barColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
