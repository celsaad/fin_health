import { Stack } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function HomeLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="spending-breakdown" options={{ title: 'Spending Breakdown' }} />
    </Stack>
  );
}
