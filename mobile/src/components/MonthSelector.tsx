import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getShortMonthName } from '../utils/format';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
}

export default function MonthSelector({ selectedMonth, selectedYear, onSelect }: MonthSelectorProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Show 6 months back + current
  const months: { month: number; year: number }[] = [];
  for (let i = -6; i <= 2; i++) {
    let m = currentMonth + i;
    let y = currentYear;
    if (m <= 0) { m += 12; y--; }
    if (m > 12) { m -= 12; y++; }
    months.push({ month: m, year: y });
  }

  useEffect(() => {
    const index = months.findIndex(
      (m) => m.month === selectedMonth && m.year === selectedYear
    );
    if (index >= 0 && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollTo({ x: index * 110 - 100, animated: false }), 100);
    }
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {months.map(({ month, year }) => {
        const isActive = month === selectedMonth && year === selectedYear;
        return (
          <TouchableOpacity
            key={`${year}-${month}`}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.primary : 'transparent',
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(month, year)}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? '#ffffff' : colors.textSecondary },
              ]}
            >
              {getShortMonthName(month)} {year !== currentYear ? year : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const PILL_HEIGHT = 40;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  pill: {
    height: PILL_HEIGHT,
    paddingHorizontal: Spacing.lg,
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FontSize.body,
    fontWeight: '500',
  },
});
