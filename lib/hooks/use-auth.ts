// lib/hooks/use-auth.ts
import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";

export function useAuth() {
  const { user, loading, initialized, signIn, signOut, initialize } =
    useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return {
    user,
    loading,
    initialized,
    signIn: async () => {
      try {
        await signIn();
      } catch (error) {
        console.error("Sign in failed:", error);
        // You can add toast notification here
      }
    },
    signOut: async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out failed:", error);
        // You can add toast notification here
      }
    },
    isAuthenticated: !!user,
  };
}
