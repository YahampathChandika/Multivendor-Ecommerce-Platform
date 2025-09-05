// components/auth/auth-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export function AuthButton() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Sign Out</span>
        </Button>
      </div>
    );
  }

  return <Button onClick={signIn}>Sign In with Google</Button>;
}
