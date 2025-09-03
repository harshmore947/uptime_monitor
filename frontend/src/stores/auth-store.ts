import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../services/api";

export interface User {
  _id: string;
  email: string;
  name?: string;
  plan: "starter" | "pro" | "business";
  isActive: boolean;
  settings: {
    notification: {
      email: boolean;
      slack: boolean;
      discord: boolean;
    };
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (
    data: Partial<
      Pick<User, "email" | "name"> & {
        password?: string;
        settings?: {
          notification?: {
            email?: boolean;
            slack?: boolean;
            discord?: boolean;
          };
          timezone?: string;
        };
      }
    >
  ) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (
      set: (
        partial:
          | AuthStore
          | Partial<AuthStore>
          | ((state: AuthStore) => AuthStore | Partial<AuthStore>)
      ) => void,
      get: () => AuthStore
    ) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { token } = await apiService.login(email, password);

          // Store token in localStorage
          localStorage.setItem("auth_token", token);

          // Get user profile
          const user = await apiService.getCurrentUser();

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });

        try {
          const { token } = await apiService.register(email, password, name);

          // Store token in localStorage
          localStorage.setItem("auth_token", token);

          // Get user profile
          const user = await apiService.getCurrentUser();

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Registration failed",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await apiService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error("Logout API error:", error);
        } finally {
          // Clear localStorage
          localStorage.removeItem("auth_token");

          // Reset state
          set({
            ...initialState,
            isLoading: false,
          });
        }
      },

      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true, error: null });

        try {
          const user = await apiService.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // If token is invalid, logout
          if (error instanceof Error && error.message.includes("token")) {
            get().logout();
          } else {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to get user profile",
            });
          }
        }
      },

      updateProfile: async (
        updateData: Partial<
          Pick<User, "email" | "name"> & {
            password?: string;
            settings?: {
              notification?: {
                email?: boolean;
                slack?: boolean;
                discord?: boolean;
              };
              timezone?: string;
            };
          }
        >
      ) => {
        const { token } = get();
        if (!token) throw new Error("Not authenticated");

        set({ isLoading: true, error: null });

        try {
          const user = await apiService.updateProfile(updateData);

          set({
            user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Profile update failed",
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
