import '../src/lib/i18n';
import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { Stack, useNavigationContainerRef, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '../src/contexts/OnboardingContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import OfflineBanner from '../src/components/OfflineBanner';
import {
  useFonts,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { env } from '../src/lib/env';

SplashScreen.preventAutoHideAsync();

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  sendDefaultPii: true,
  enableLogs: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableNativeFramesTracking: !isRunningInExpoGo(),
  integrations: [
    navigationIntegration,
    Sentry.mobileReplayIntegration({ maskAllText: true, maskAllImages: true }),
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function InnerLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasOnboarded } = useOnboarding();
  const { isReady: themeReady, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const isAppReady = !isLoading && hasOnboarded !== null && themeReady;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  useEffect(() => {
    if (!isAppReady) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';

    if (!hasOnboarded && !inOnboarding && !inAuth) {
      router.replace('/onboarding');
    } else if (hasOnboarded && !isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (hasOnboarded && isAuthenticated && !inTabs) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isAppReady, hasOnboarded, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
      <OfflineBanner />
    </>
  );
}

function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  const [fontsLoaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <OnboardingProvider>
                <AuthProvider>
                  <InnerLayout />
                </AuthProvider>
              </OnboardingProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
