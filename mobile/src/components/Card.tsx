import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceBright : colors.card,
          ...(isDark
            ? {}
            : {
                shadowColor: colors.primary,
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                ...Platform.select({ android: { elevation: 2 } }),
              }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
});
