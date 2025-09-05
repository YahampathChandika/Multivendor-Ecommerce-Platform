// app/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/explore";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile exists in public.users table
      try {
        const { error: profileError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email!,
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          },
          {
            onConflict: "id",
            ignoreDuplicates: false,
          }
        );

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError);
        // Don't fail the authentication process if profile creation fails
      }

      // Successful authentication, redirect to intended page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
