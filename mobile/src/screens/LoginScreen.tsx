import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@fin-health/shared/validators';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { parseError } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { FontSize, Spacing } from '../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: { email: string; password: string }) {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err) {
      const appError = parseError(err);
      Alert.alert('Login Failed', appError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            accessibilityLabel="FinHealth"
          />
          <Text style={[styles.appName, { color: colors.text }]}>FinHealth</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Welcome back to your financial health
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              rightLabel={{
                text: 'Forgot?',
                onPress: () =>
                  Alert.alert(
                    'Reset Password',
                    'Please use the web app to reset your password at finhealth.app/forgot-password',
                  ),
              }}
            />
          )}
        />

        <Button
          title="Login"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginTop: Spacing.sm }}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl + 8,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.pageTitle,
    fontWeight: '700',
  },
  tagline: {
    fontSize: FontSize.body,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { fontSize: FontSize.body },
  footerLink: { fontSize: FontSize.body, fontWeight: '600' },
});
