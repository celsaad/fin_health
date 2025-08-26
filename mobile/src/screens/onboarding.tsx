import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

import { Button, ScreenContainer } from "@/src/components/ui";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    router.push("/auth");
  }, [router]);

  const handleLearnMore = useCallback(() => {
    // Navigate to learn more or skip for now
    router.push("/auth");
  }, [router]);

  return (
    <ScreenContainer statusBarStyle="light">
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        <View style={styles.imageContainer}>
          {/* Placeholder for the character illustration */}
          <View style={styles.characterPlaceholder}>
            <Text style={styles.characterEmoji}>💰</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>Welcome to Finance Tracker</Text>
        <Text style={styles.subtitle}>
          Track your expenses, set budgets, and achieve your financial goals
          with ease.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleGetStarted}
          />

          <Button
            title="Learn More"
            variant="secondary"
            size="large"
            fullWidth
            onPress={handleLearnMore}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  characterPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#e8f5e8",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  characterEmoji: {
    fontSize: 80,
  },
  contentSection: {
    flex: 0.4,
    paddingHorizontal: 30,
    paddingBottom: 50,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
});
