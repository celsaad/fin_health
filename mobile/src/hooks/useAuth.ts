import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, createContext, useContext } from "react";
import { useMutation } from "react-relay";

import { AuthMutations_LoginMutation } from "@/src/mutations/__generated__/AuthMutations_LoginMutation.graphql";
import { AuthMutations_RegisterMutation } from "@/src/mutations/__generated__/AuthMutations_RegisterMutation.graphql";
import { LoginMutation, RegisterMutation } from "@/src/mutations/AuthMutations";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] =
    useMutation<AuthMutations_LoginMutation>(LoginMutation);
  const [registerMutation] =
    useMutation<AuthMutations_RegisterMutation>(RegisterMutation);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");

      console.log("Auth check:", { token: !!token, userData: !!userData });

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log("Setting user:", parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginInput) => {
    try {
      setLoading(true);

      const response = await new Promise<any>((resolve, reject) => {
        loginMutation({
          variables: {
            input: credentials,
          },
          onCompleted: (data) => {
            console.log("Login response:", data);
            resolve(data);
          },
          onError: (error) => {
            console.error("Login error:", error);
            reject(error);
          },
        });
      });

      console.log("Processing login response:", response);

      if (response.login?.token && response.login?.user) {
        await AsyncStorage.setItem("authToken", response.login.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(response.login.user),
        );
        console.log("Login successful, setting user:", response.login.user);
        setUser(response.login.user);
      } else {
        console.error("Invalid login response structure:", response);
        throw new Error("Invalid login response");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      setLoading(true);

      const response = await new Promise<any>((resolve, reject) => {
        registerMutation({
          variables: {
            input: data,
          },
          onCompleted: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        });
      });

      if (response.register?.token && response.register?.user) {
        await AsyncStorage.setItem("authToken", response.register.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(response.register.user),
        );
        setUser(response.register.user);
      } else {
        throw new Error("Invalid registration response");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };
}
