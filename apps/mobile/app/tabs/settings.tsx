/**
 * Settings screen
 */

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '../../lib/trpc';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleChangeCurrency = () => {
    Alert.alert('Coming Soon', 'Currency selection will be implemented');
  };

  const handleChangeTimezone = () => {
    Alert.alert('Coming Soon', 'Timezone selection will be implemented');
  };

  const handleChangeMonthStartDay = () => {
    Alert.alert('Coming Soon', 'Month start day selection will be implemented');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{user?.email}</Text>
              </View>
            </Card>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Card>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingValue}>{settings?.currency || 'USD'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Timezone</Text>
                <Text style={styles.settingValue} numberOfLines={1}>
                  {settings?.timezone || 'America/New_York'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Month Start Day</Text>
                <Text style={styles.settingValue}>
                  {settings?.monthStartDay || 1}
                </Text>
              </View>
            </Card>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Card>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </Card>
          </View>

          {/* Sign Out */}
          <View style={styles.section}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
            />
          </View>

          <Text style={styles.footer}>
            Made with ❤️ using Claude Code
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
