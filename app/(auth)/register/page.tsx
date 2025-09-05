// app/(auth)/register/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/explore");
    }
  }, [isAuthenticated, router]);

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

        {/* Register Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Join thousands of happy customers and start shopping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-2">Why create an account?</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Save your favorite items</li>
              <li>• Track your orders</li>
              <li>• Faster checkout</li>
              <li>• Exclusive member offers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
