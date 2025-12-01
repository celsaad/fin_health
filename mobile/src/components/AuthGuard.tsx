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

    if (!isAuthenticated && !inAuthFlow) {
      // Unauthenticated user not on auth flow - redirect to onboarding
      console.log(
        "Redirecting to onboarding: unauthenticated user not in auth flow",
      );
      router.replace("/onboarding");
    } else if (isAuthenticated && inAuthFlow) {
      // Authenticated user on auth pages - redirect to tabs
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
