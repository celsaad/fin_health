import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import AuthGuard from "@/src/components/AuthGuard";

import RelayProvider from "@/src/relay/RelayProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <RelayProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="transaction-details"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="add-account"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="account-details"
              options={{ headerShown: false, presentation: "modal" }}
            />
          </Stack>
        </AuthGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RelayProvider>
  );
}
