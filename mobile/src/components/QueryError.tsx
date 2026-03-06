import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FontSize, Spacing } from '../constants/theme';

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function QueryError({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: QueryErrorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AlertTriangle size={40} color={colors.destructive} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl * 2,
  },
  message: {
    fontSize: FontSize.body,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
});
