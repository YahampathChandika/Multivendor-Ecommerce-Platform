// lib/utils/auth-middleware.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiError } from "./api-response";
import type { User } from "@supabase/supabase-js";

export async function withAuth<T>(
  handler: (user: User, request: Request) => Promise<T>
) {
  return async (request: Request) => {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return createApiError("Unauthorized", 401);
      }

      return await handler(user, request);
    } catch (error) {
      return createApiError("Authentication failed", 401, error);
    }
  };
}
