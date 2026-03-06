import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@fin-health/shared/validators';
import { BarChart3, Heart } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

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
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <BarChart3 size={32} color="#ffffff" />
            <View style={styles.heartBadge}>
              <Heart size={12} color="#ffffff" fill="#ffffff" />
            </View>
          </View>
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
              rightLabel={{ text: 'Forgot?', onPress: () => {} }}
            />
          )}
        />

        <Button
          title="Login"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginTop: Spacing.sm }}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
            OR CONTINUE WITH
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
          </TouchableOpacity>
        </View>

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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.caption,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { fontSize: FontSize.body },
  footerLink: { fontSize: FontSize.body, fontWeight: '600' },
});
