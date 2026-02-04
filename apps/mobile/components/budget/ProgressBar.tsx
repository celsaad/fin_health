/**
 * Progress bar component
 */

import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, showPercentage = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isOverBudget = current > total;

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%` },
            isOverBudget && styles.barOverBudget,
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, isOverBudget && styles.overBudgetText]}>
          {percentage.toFixed(0)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  barOverBudget: {
    backgroundColor: '#FF3B30',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  overBudgetText: {
    color: '#FF3B30',
  },
});
