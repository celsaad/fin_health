import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@fin-health/shared/validators';
import { BarChart3, Heart } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { parseError } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { FontSize, Spacing } from '../constants/theme';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(data: { name: string; email: string; password: string }) {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
    } catch (err) {
      const appError = parseError(err);
      Alert.alert('Signup Failed', appError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <BarChart3 size={32} color="#ffffff" />
            <View style={styles.heartBadge}>
              <Heart size={12} color="#ffffff" fill="#ffffff" />
            </View>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>FinHealth</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Create your account</Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

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
              placeholder="Min. 6 characters"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginTop: Spacing.sm }}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
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
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#dc2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: Spacing.xxl,
  },
  footerText: { fontSize: FontSize.body },
  footerLink: { fontSize: FontSize.body, fontWeight: '600' },
});
