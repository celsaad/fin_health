import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ArrowLeftRight, PieChart, Settings, Plus, Camera } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import SpendingBreakdownScreen from '../screens/SpendingBreakdownScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import RecurringScreen from '../screens/RecurringScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AddTransactionSheet from '../components/AddTransactionSheet';
import ReceiptScannerSheet from '../components/ReceiptScannerSheet';
import type { TransactionPrefillData } from '@fin-health/shared';
import type {
  MainTabParamList,
  HomeStackParamList,
  HistoryStackParamList,
  BudgetStackParamList,
  ProfileStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const BudgetStack = createNativeStackNavigator<BudgetStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  const { colors } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SpendingBreakdown"
        component={SpendingBreakdownScreen}
        options={{ title: 'Spending Breakdown' }}
      />
    </HomeStack.Navigator>
  );
}

function HistoryStackScreen() {
  const { colors } = useTheme();
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <HistoryStack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
    </HistoryStack.Navigator>
  );
}

function BudgetStackScreen() {
  const { colors } = useTheme();
  return (
    <BudgetStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <BudgetStack.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{ headerShown: false }}
      />
      <BudgetStack.Screen
        name="Recurring"
        component={RecurringScreen}
        options={{ title: 'Recurring' }}
      />
    </BudgetStack.Navigator>
  );
}

function ProfileStackScreen() {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Manage Categories' }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </ProfileStack.Navigator>
  );
}

function EmptyScreen() {
  return null;
}

export function MainTabNavigator() {
  const { colors } = useTheme();
  const { featureFlags } = useAuth();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [prefillData, setPrefillData] = useState<TransactionPrefillData | null>(null);

  function handleScanComplete(data: TransactionPrefillData) {
    setPrefillData(data);
    setShowAddSheet(true);
  }

  return (
    <>
      <Tab.Navigator
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
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStackScreen}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="AddPlaceholder"
          component={EmptyScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => null,
            tabBarButton: (_props) => (
              <View style={styles.fabContainer}>
                {featureFlags.receiptScanning && (
                  <TouchableOpacity
                    style={[
                      styles.scanBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => setShowScanner(true)}
                    activeOpacity={0.8}
                  >
                    <Camera size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setPrefillData(null);
                    setShowAddSheet(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Plus size={28} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="BudgetTab"
          component={BudgetStackScreen}
          options={{
            tabBarLabel: 'Budget',
            tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
      <AddTransactionSheet
        visible={showAddSheet}
        onClose={() => {
          setShowAddSheet(false);
          setPrefillData(null);
        }}
        prefillData={prefillData}
      />
      {featureFlags.receiptScanning && (
        <ReceiptScannerSheet
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    flex: 1,
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  scanBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
