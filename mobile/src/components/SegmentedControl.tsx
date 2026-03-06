import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SegmentedControl({
  options,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBg }]}>
      {options.map((option, index) => {
        const isActive = index === selectedIndex;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.option, isActive && { backgroundColor: colors.primary }]}
            onPress={() => onSelect(index)}
          >
            <Text style={[styles.text, { color: isActive ? '#ffffff' : colors.textSecondary }]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md - 2,
    alignItems: 'center',
  },
  text: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
});
