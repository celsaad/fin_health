import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@fin-health/shared/validators';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { changePassword } from '../services/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import { Spacing } from '../constants/theme';

export default function ChangePasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  async function onSubmit(data: { currentPassword: string; newPassword: string }) {
    setLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      Toast.show({ type: 'success', text1: 'Password updated' });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Current Password"
            placeholder="Enter current password"
            isPassword
            value={value}
            onChangeText={onChange}
            error={errors.currentPassword?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="New Password"
            placeholder="Min. 6 characters"
            isPassword
            value={value}
            onChangeText={onChange}
            error={errors.newPassword?.message}
          />
        )}
      />
      <Button
        title="Update Password"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
});
