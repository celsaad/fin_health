import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Monitor,
  DollarSign,
  ChevronRight,
  LogOut,
  Grid3X3,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors, preference, setPreference, isDark } = useTheme();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  function confirmLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  const themeOptions = [
    { key: 'light' as const, label: 'Light', Icon: Sun },
    { key: 'dark' as const, label: 'Dark', Icon: Moon },
    { key: 'system' as const, label: 'System', Icon: Monitor },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Account Info */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT INFO</Text>
        <Card style={styles.sectionCard}>
          <SettingsRow
            icon={<User size={18} color={colors.textSecondary} />}
            label="Full Name"
            value={user?.name ?? ''}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={<Mail size={18} color={colors.textSecondary} />}
            label="Email Address"
            value={user?.email ?? ''}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
            <SettingsRow
              icon={<Lock size={18} color={colors.textSecondary} />}
              label="Change Password"
              subtitle="Update your password"
              colors={colors}
              showChevron
            />
          </TouchableOpacity>
        </Card>

        {/* Display Preferences */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISPLAY PREFERENCES</Text>
        <Card style={styles.sectionCard}>
          <Text style={[styles.prefLabel, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeSelector}>
            {themeOptions.map(({ key, label, Icon }) => {
              const isActive = preference === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setPreference(key)}
                >
                  <Icon size={16} color={isActive ? '#fff' : colors.textSecondary} />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: isActive ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />

          <View style={styles.settingsRow}>
            <DollarSign size={18} color={colors.textSecondary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Base Currency</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>USD ($)</Text>
          </View>
        </Card>

        {/* Manage */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MANAGE</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <SettingsRow
              icon={<Grid3X3 size={18} color={colors.textSecondary} />}
              label="Categories"
              subtitle="Manage your categories"
              colors={colors}
              showChevron
            />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          variant="destructive"
          onPress={confirmLogout}
          style={styles.logoutBtn}
        />

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          FinHealth v2.4.1 (Build 890)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  subtitle,
  colors,
  showChevron,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  subtitle?: string;
  colors: any;
  showChevron?: boolean;
}) {
  return (
    <View style={styles.settingsRow}>
      {icon}
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>{value}</Text>}
      {showChevron && <ChevronRight size={18} color={colors.textSecondary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: FontSize.pageTitle, fontWeight: '700', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  profileSection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  userName: { fontSize: FontSize.sectionHeader, fontWeight: '700', marginTop: Spacing.md },
  userEmail: { fontSize: FontSize.body, marginTop: 4 },
  sectionLabel: { fontSize: FontSize.caption, fontWeight: '600', letterSpacing: 0.5, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  sectionCard: { padding: 0 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: FontSize.body, fontWeight: '500' },
  rowSubtitle: { fontSize: FontSize.caption, marginTop: 2 },
  rowValue: { fontSize: FontSize.body, maxWidth: 150 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.lg },
  prefLabel: { fontSize: FontSize.body, fontWeight: '500', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  themeSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md - 2,
    gap: 4,
  },
  themeLabel: { fontSize: FontSize.caption, fontWeight: '500' },
  logoutBtn: { marginTop: Spacing.xxl },
  version: { fontSize: FontSize.caption, textAlign: 'center', marginTop: Spacing.lg },
});
