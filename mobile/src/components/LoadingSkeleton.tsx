import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <LoadingSkeleton width={40} height={40} borderRadius={20} />
      <View style={styles.cardContent}>
        <LoadingSkeleton width="60%" height={16} />
        <LoadingSkeleton width="40%" height={12} style={{ marginTop: 8 }} />
      </View>
      <LoadingSkeleton width={80} height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
});
