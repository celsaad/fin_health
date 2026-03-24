import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Landmark, ArrowDown, ArrowUp, ListChecks, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../Card';
import { formatCurrency } from '@fin-health/shared/format';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { DashboardSummary } from '../../types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary;
  netChangePercent: number | null;
}

export default function SummaryCards({ summary, netChangePercent }: SummaryCardsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {/* Net Balance — Full-width gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.netCard}
      >
        <View style={styles.decorativeCircle} />
        <Landmark size={32} color="rgba(255,255,255,0.3)" style={styles.bgIcon} />
        <Text style={styles.netLabel}>
          {t('dashboard.netBalance').toUpperCase()}
        </Text>
        <Text style={styles.netAmount}>
          {formatCurrency(summary.net)}
        </Text>
        {netChangePercent !== null && (
          <View style={styles.momBadge}>
            {netChangePercent >= 0 ? (
              <TrendingUp size={12} color="#fff" />
            ) : (
              <TrendingDown size={12} color="#fff" />
            )}
            <Text style={styles.momText}>
              {netChangePercent >= 0 ? '+' : ''}
              {netChangePercent.toFixed(1)}% {t('dashboard.vsLastMonth')}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Income */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
            <ArrowDown size={20} color="#16a34a" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.income').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {formatCurrency(summary.totalIncome)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.earnedThisMonth')}
        </Text>
      </Card>

      {/* Expenses */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
            <ArrowUp size={20} color="#dc2626" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.expenses').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {formatCurrency(summary.totalExpenses)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.spentThisMonth')}
        </Text>
      </Card>

      {/* Transactions */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
            <ListChecks size={20} color="#2563eb" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('dashboard.transactionCount').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {String(summary.transactionCount)}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {t('dashboard.totalTransactions')}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  netCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bgIcon: { position: 'absolute', top: Spacing.lg, right: Spacing.lg },
  netLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
    letterSpacing: 1.5,
  },
  netAmount: {
    fontFamily: FontFamily.headline,
    fontSize: 28,
    color: '#fff',
    marginTop: Spacing.xs,
  },
  momBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    gap: 4,
  },
  momText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.caption, color: '#fff' },
  halfCard: { width: '48%', marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, letterSpacing: 1.2 },
  cardAmount: { fontFamily: FontFamily.headline, fontSize: 22, marginTop: Spacing.md },
  cardSubtitle: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.caption, marginTop: Spacing.xs },
});
