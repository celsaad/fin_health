import { useState, useEffect, createContext } from "react";

import { AuthManager } from "@/src/relay/Environment";
import { AuthService } from "@/src/services/AuthService";

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

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      console.log("Auth check:", { isAuthenticated: isAuth });

      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        console.log("Setting user:", userData);
        setUser(userData);
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
      const authData = await AuthService.login(credentials);
      console.log("Login successful, setting user:", authData.user);
      setUser(authData.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      setLoading(true);
      const authData = await AuthService.register(data);
      setUser(authData.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
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
