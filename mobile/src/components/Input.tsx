import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightLabel?: { text: string; onPress: () => void };
  isPassword?: boolean;
}

export default function Input({
  label,
  error,
  rightLabel,
  isPassword,
  style,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {(label || rightLabel) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
          {rightLabel && (
            <TouchableOpacity onPress={rightLabel.onPress}>
              <Text style={[styles.rightLabel, { color: colors.primary }]}>{rightLabel.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: '500',
  },
  rightLabel: {
    fontSize: FontSize.caption,
    fontWeight: '500',
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
  eyeBtn: {
    padding: Spacing.sm,
  },
  error: {
    fontSize: FontSize.caption,
    marginTop: 4,
  },
});
