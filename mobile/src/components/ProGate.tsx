import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { usePlan } from '../hooks/usePlan';
import { useTheme } from '../contexts/ThemeContext';
import { FontSize, Spacing } from '../constants/theme';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function UpgradePrompt() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Card>
      <View style={styles.header} accessibilityRole="header">
        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
        <Text style={[styles.title, { color: colors.text }]}>{t('plan.upgradeTitle')}</Text>
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('plan.upgradeDescription')}
      </Text>
    </Card>
  );
}

export default function ProGate({ children, fallback }: ProGateProps) {
  const { isPro } = usePlan();

  if (isPro) {
    return <>{children}</>;
  }

  return <>{fallback ?? <UpgradePrompt />}</>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.sm,
  },
});
