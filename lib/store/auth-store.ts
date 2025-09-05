// lib/store/auth-store.ts
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  signIn: async () => {
    const supabase = createClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      set({ loading: false });
    }
  },

  initialize: async () => {
    const supabase = createClient();

    try {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ user: session?.user ?? null });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ user: session?.user ?? null });

        // Create user profile if it doesn't exist
        if (session?.user && event === "SIGNED_IN") {
          await ensureUserProfile(session.user);
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ initialized: true });
    }
  },
}));

// Helper function to ensure user profile exists
async function ensureUserProfile(user: User) {
  const supabase = createClient();

  try {
    // Check if user profile exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // Create user profile if it doesn't exist
    if (!existingUser) {
      const { error } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
      });

      if (error && error.code !== "23505") {
        // Ignore duplicate key error
        console.error("Error creating user profile:", error);
      }
    }
  } catch (error) {
    console.error("Error ensuring user profile:", error);
  }
}
