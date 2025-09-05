// components/auth/login-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";

export function LoginForm() {
  const { signIn, loading } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue shopping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={signIn} disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </CardContent>
    </Card>
  );
}
