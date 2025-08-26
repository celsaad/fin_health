import { commitMutation } from "react-relay";

import { LoginMutation, RegisterMutation } from "../mutations/AuthMutations";
import environment, { AuthManager } from "../relay/Environment";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const AuthService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      commitMutation(environment, {
        mutation: LoginMutation,
        variables: { input },
        onCompleted: async (response: any, errors) => {
          if (errors) {
            reject(new Error(errors[0]?.message || "Login failed"));
            return;
          }

          const authData = response.login;
          await AuthManager.setToken(authData.token);
          await AuthManager.setUserData(authData.user);

          resolve(authData);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      commitMutation(environment, {
        mutation: RegisterMutation,
        variables: { input },
        onCompleted: async (response: any, errors) => {
          if (errors) {
            reject(new Error(errors[0]?.message || "Registration failed"));
            return;
          }

          const authData = response.register;
          await AuthManager.setToken(authData.token);
          await AuthManager.setUserData(authData.user);

          resolve(authData);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  },

  async logout(): Promise<void> {
    await AuthManager.removeToken();
    // Clear the Relay store
    environment.getStore().getSource().clear();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AuthManager.getToken();
    return !!token;
  },

  async getCurrentUser(): Promise<any | null> {
    return await AuthManager.getUserData();
  },
};
