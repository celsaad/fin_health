import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from './Button';
import { usePlan } from '../hooks/usePlan';
import { useTheme } from '../contexts/ThemeContext';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function UpgradePrompt() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: `${colors.primary}10`,
          borderColor: `${colors.primary}33`,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}1A` }]}>
        <Ionicons name="lock-closed" size={18} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{t('plan.upgradeTitle')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {t('plan.upgradeDescription')}
        </Text>
      </View>
      <Button
        title={t('plan.upgradeCta')}
        onPress={() => navigation.navigate('ProfileTab')}
        style={styles.ctaButton}
      />
    </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  ctaButton: {
    height: 36,
    paddingHorizontal: Spacing.md,
  },
});
