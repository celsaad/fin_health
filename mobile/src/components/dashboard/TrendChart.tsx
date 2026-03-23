import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import { getShortMonthName } from '@fin-health/shared/format';
import { FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { TrendItem } from '../../types/dashboard';

interface TrendChartProps {
  trend: TrendItem[];
}

const OPACITY_RAMP = [0.25, 0.4, 0.55, 0.7, 0.85, 1.0];

export default function TrendChart({ trend }: TrendChartProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const maxBar = Math.max(
    ...trend.map((item) => Math.max(item.income || 0, item.expense || 0)),
    1,
  );

  const lastIndex = trend.length - 1;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('dashboard.cashFlowTrend')}
        </Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t('dashboard.incomeLabel').toUpperCase()}
          </Text>
          <View style={[styles.legendDot, { backgroundColor: colors.expense, marginLeft: 12 }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            {t('dashboard.expenseLabel').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.barChart}>
        {trend.map((item, i) => {
          const opacityIndex = trend.length <= 6
            ? OPACITY_RAMP.length - trend.length + i
            : Math.min(i, OPACITY_RAMP.length - 1);
          const opacity = OPACITY_RAMP[opacityIndex] ?? 1;
          const isCurrent = i === lastIndex;

          return (
            <View key={`${item.month}-${item.year}`} style={styles.barGroup}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(((item.income || 0) / maxBar) * 100, 4),
                      backgroundColor: colors.primary,
                      opacity,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(((item.expense || 0) / maxBar) * 100, 4),
                      backgroundColor: colors.expense,
                      opacity,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isCurrent ? colors.text : colors.textSecondary,
                    fontFamily: isCurrent ? FontFamily.bodySemiBold : FontFamily.bodyMedium,
                  },
                ]}
              >
                {getShortMonthName(item.month)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontFamily: FontFamily.headlineSemiBold, fontSize: FontSize.sectionHeader },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 10 },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barGroup: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100 },
  bar: { width: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 4 },
});
