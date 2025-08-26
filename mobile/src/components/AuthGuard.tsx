import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthFlow = segments[0] === "onboarding" || segments[0] === "auth";

    console.log("AuthGuard debug:", {
      isAuthenticated,
      loading,
      segments,
      inTabsGroup,
      inAuthFlow,
    });

    if (!isAuthenticated && inTabsGroup) {
      // Unauthenticated user trying to access protected tabs
      console.log("Redirecting to onboarding: unauthenticated user in tabs");
      router.replace("/onboarding");
    } else if (isAuthenticated && (inAuthFlow || segments.length === 0)) {
      // Authenticated user on auth pages or root - redirect to tabs
      console.log("Redirecting to tabs: authenticated user in auth flow");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, router, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
