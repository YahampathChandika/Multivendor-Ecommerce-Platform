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
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
