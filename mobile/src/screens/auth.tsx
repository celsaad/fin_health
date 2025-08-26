import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Button, Input, ScreenContainer } from "@/src/components/ui";
import { useAuth } from "@/src/hooks/useAuth";

export default function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async () => {
    if (loading) return;

    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !formData.name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", name: "" });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to continue to your account"
              : "Sign up to get started with Finance Tracker"}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
              autoCapitalize="words"
            />
          )}

          <Input
            placeholder="Email"
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            placeholder="Password"
            value={formData.password}
            onChangeText={(password) => setFormData({ ...formData, password })}
            secureTextEntry
          />
        </View>

        <View style={styles.actions}>
          <Button
            title={loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit}
            disabled={loading}
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <Button
              title={isLogin ? "Sign Up" : "Sign In"}
              variant="ghost"
              size="small"
              onPress={() => toggleMode()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  actions: {
    gap: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
  },
});
