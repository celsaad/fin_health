import { RelativePathString, useRouter } from "expo-router";
import { SFSymbol } from "expo-symbols";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";

import { Header, Section, Card, ScreenContainer } from "@/src/components/ui";
import { IconSymbol } from "@/src/components/ui/IconSymbol";

import { useAuth } from "../../hooks/useAuth";

type SettingItem = {
  icon: SFSymbol;
  title: string;
  description: string;
  action?: () => void;
  navigationPath?: RelativePathString;
};

const accountSettings: SettingItem[] = [
  {
    icon: "person.fill",
    title: "Personal Information",
    description: "Manage your personal information",
    action: () => console.log("Personal Information"),
  },
  {
    icon: "star.fill",
    title: "Subscription",
    description: "Manage your subscription",
    action: () => console.log("Subscription"),
  },
  {
    icon: "link",
    title: "Linked Accounts",
    description: "Manage your linked accounts",
    action: () => console.log("Linked Accounts"),
  },
  {
    icon: "arrow.triangle.swap",
    title: "Categories",
    description: "Manage your categories",
    navigationPath: "/categories",
  },
];

const preferencesSettings: SettingItem[] = [
  {
    icon: "gear",
    title: "App Preferences",
    description: "Customize your app experience",
    action: () => console.log("App Preferences"),
  },
  {
    icon: "bell.fill",
    title: "Notifications",
    description: "Manage your notification settings",
    action: () => console.log("Notifications"),
  },
  {
    icon: "shield.fill",
    title: "Security",
    description: "Manage your security settings",
    action: () => console.log("Security"),
  },
];

const supportSettings: SettingItem[] = [
  {
    icon: "questionmark.circle.fill",
    title: "Help & Support",
    description: "Get help and support",
    action: () => console.log("Help & Support"),
  },
  {
    icon: "info.circle.fill",
    title: "About",
    description: "Learn more about the app",
    action: () => console.log("About"),
  },
];

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (route: RelativePathString) => {
    router.push(route);
  };

  const handlePress = useCallback(
    (item: SettingItem) => () => {
      if (item.action) {
        item.action();
      }
      if (item.navigationPath) {
        handleNavigation(item.navigationPath);
      }
    },
    [handleNavigation],
  );

  const renderSettingItem = (item: SettingItem) => (
    <Card key={item.title} margin="small" onPress={handlePress(item)}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <IconSymbol name={item.icon} size={20} color="#666" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color="#ccc" />
      </View>
    </Card>
  );

  return (
    <ScreenContainer hasTabBar>
      {/* Header */}
      <Header title="Settings" leftIcon="chevron.left" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Section title="Account">
          {accountSettings.map(renderSettingItem)}
        </Section>

        {/* Preferences Section */}
        <Section title="Preferences">
          {preferencesSettings.map(renderSettingItem)}
        </Section>

        {/* Support Section */}
        <Section title="Support">
          {supportSettings.map(renderSettingItem)}
        </Section>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <Button title="Logout" onPress={logout} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
  },
});
