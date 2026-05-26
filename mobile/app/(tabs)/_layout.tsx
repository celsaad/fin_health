import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, ArrowLeftRight, PieChart, Settings, Plus } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import AddTransactionSheet from '../../src/components/AddTransactionSheet';

export default function TabsLayout() {
  const { colors } = useTheme();
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            height: 85,
            paddingBottom: 25,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarLabel: '',
            tabBarIcon: () => null,
            href: null,
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => setShowAddSheet(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.fab, { backgroundColor: colors.primary }]}>
                  <Plus size={28} color="#ffffff" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            tabBarLabel: 'Budget',
            tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      <AddTransactionSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    flex: 1,
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
