import AsyncStorage from "@react-native-async-storage/async-storage";
import { Environment, Network, RecordSource, Store } from "relay-runtime";

const SERVER_URL = "http://127.0.0.1:8080";
const PUBLIC_ENDPOINT = `${SERVER_URL}/query`;
const PROTECTED_ENDPOINT = `${SERVER_URL}/api/query`;

// Storage keys
const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

// Auth management
export const AuthManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Error setting user data:", error);
    }
  },
};

// Network layer
const fetchQuery = async (operation: any, variables: any) => {
  const isAuthMutation =
    operation.name === "AuthMutations_LoginMutation" ||
    operation.name === "AuthMutations_RegisterMutation";
  const endpoint = isAuthMutation ? PUBLIC_ENDPOINT : PROTECTED_ENDPOINT;

  console.log("DEBUG: Operation name:", operation.name);
  console.log("DEBUG: Is auth mutation:", isAuthMutation);
  console.log("DEBUG: Endpoint:", endpoint);
  console.log("DEBUG: Variables:", JSON.stringify(variables));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header for protected endpoints
  if (!isAuthMutation) {
    const token = await AuthManager.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  console.log("DEBUG: Headers:", headers);

  const body = JSON.stringify({
    query: operation.text,
    variables,
  });

  console.log("DEBUG: Request body:", body);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
  });

  console.log("DEBUG: Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DEBUG: Error response body:", errorText);
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  console.log("DEBUG: Response result:", JSON.stringify(result));

  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0]?.message || "GraphQL error");
  }

  return result;
};

// Create network
const network = Network.create(fetchQuery);

// Create store
const store = new Store(new RecordSource());

// Create environment
const environment = new Environment({
  network,
  store,
});

export default environment;
