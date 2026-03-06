import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  bgColor: string;
}

export default function Badge({ label, color, bgColor }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontSize: FontSize.caption - 1,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
