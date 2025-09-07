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
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error; // Re-throw to let useAuth handle it
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    set({ loading: true });

    try {
      // Clear user state immediately for UI responsiveness
      set({ user: null });

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: "global", // Sign out from all sessions
      });

      if (error) {
        console.error("Sign out error:", error);
        // Don't throw here - user state is already cleared
      }

      // Force redirect to home page to ensure clean state
      if (typeof window !== "undefined") {
        // Clear any cached data
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }

        // Redirect to home page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out failed:", error);
      // Even if there's an error, clear the user state
      set({ user: null });

      // Still try to redirect
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
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
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        set({ user: null });
      } else if (session?.user) {
        set({ user: session.user });
        await ensureUserProfile(session.user);
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);

        const user = session?.user ?? null;
        set({ user });

        // Handle specific events
        if (event === "SIGNED_OUT") {
          // Ensure user is cleared
          set({ user: null });

          // Clear any local storage or cached data
          if (typeof window !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
          }
        } else if (
          user &&
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
        ) {
          await ensureUserProfile(user);
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ user: null });
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
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // If user doesn't exist, create profile
    if (!existingUser && checkError?.code === "PGRST116") {
      console.log("Creating user profile for:", user.email);

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

      if (insertError) {
        // Ignore duplicate key error (race condition)
        if (insertError.code !== "23505") {
          console.error("Error creating user profile:", insertError);
        }
      } else {
        console.log("User profile created successfully");
      }
    } else if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking user profile:", checkError);
    }
  } catch (error) {
    console.error("Error ensuring user profile:", error);
  }
}
