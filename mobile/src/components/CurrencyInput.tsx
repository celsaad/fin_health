import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

// Max representable amount: 999,999.99 (in cents: 99_999_999)
const MAX_CENTS = 99_999_999;

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
}

export default function CurrencyInput({ value, onChange, label, error }: CurrencyInputProps) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [cents, setCents] = useState(() => Math.round((value || 0) * 100));
  const prevValueRef = useRef(value);
  // onKeyPress fires before onChangeText — flag to skip onChangeText for normal keystrokes
  const handledByKeyPress = useRef(false);

  // Sync when form resets the value externally
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setCents(Math.round((value || 0) * 100));
      prevValueRef.current = value;
    }
  }, [value]);

  const displayValue = (cents / 100).toLocaleString(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function handleKeyPress({ nativeEvent }: { nativeEvent: { key: string } }) {
    const { key } = nativeEvent;
    if (key >= '0' && key <= '9') {
      handledByKeyPress.current = true;
      const newCents = Math.min(cents * 10 + parseInt(key, 10), MAX_CENTS);
      setCents(newCents);
      onChange(newCents / 100);
    } else if (key === 'Backspace') {
      handledByKeyPress.current = true;
      const newCents = Math.floor(cents / 10);
      setCents(newCents);
      onChange(newCents / 100);
    }
  }

  function handleChangeText(text: string) {
    if (handledByKeyPress.current) {
      handledByKeyPress.current = false;
      return; // already handled by onKeyPress, skip
    }
    // Paste: strip all non-digits and treat the sequence as cents
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setCents(0);
      onChange(0);
      return;
    }
    const newCents = Math.min(parseInt(digits, 10), MAX_CENTS);
    setCents(newCents);
    onChange(newCents / 100);
  }

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.destructive : 'transparent',
          },
        ]}
      >
        <TextInput
          value={displayValue}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          keyboardType="numeric"
          // Pin cursor to end so the display always feels right-aligned
          selection={{ start: displayValue.length, end: displayValue.length }}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FontSize.body,
  },
  error: {
    fontSize: FontSize.caption,
    marginTop: 4,
  },
});
