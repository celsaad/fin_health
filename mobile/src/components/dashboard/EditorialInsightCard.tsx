import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { Insight } from '../../services/dashboard';

interface EditorialInsightCardProps {
  insights: Insight[];
  isPro: boolean;
}

export default function EditorialInsightCard({ insights, isPro }: EditorialInsightCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (insights.length === 0) return null;

  const topInsight = insights[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <Sparkles size={20} color="rgba(255,255,255,0.7)" />
      <Text style={styles.title}>{t('dashboard.editorialInsight')}</Text>

      {isPro ? (
        <>
          <Text style={styles.body} numberOfLines={3}>
            {topInsight.description}
          </Text>
          {insights.length > 1 && (
            <Text style={styles.seeAll}>
              {t('dashboard.seeAllInsights', { count: insights.length })}
            </Text>
          )}
        </>
      ) : (
        <View style={styles.proGate}>
          <Text style={styles.body} numberOfLines={1}>
            ••••••••••••••••••••••••••
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.upgradeToPro')}
          >
            <Text style={[styles.upgradeText, { color: colors.primary }]}>
              {t('dashboard.upgradeToPro')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.label,
    color: '#fff',
    marginTop: Spacing.sm,
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  seeAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.md,
  },
  proGate: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  upgradeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.body,
  },
});
