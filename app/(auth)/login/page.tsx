// app/(auth)/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/explore";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Redirect Info */}
        {redirectTo !== "/explore" && (
          <div className="text-center text-xs text-muted-foreground bg-orange-50 p-3 rounded-lg">
            You&apos;ll be redirected to your intended page after signing in
          </div>
        )}
      </div>
    </div>
  );
}
