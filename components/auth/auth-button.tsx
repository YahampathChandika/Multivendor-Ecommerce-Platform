// components/auth/auth-button.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export function AuthButton() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (isAuthenticated) {
    const avatarUrl = user?.user_metadata?.avatar_url;
    const displayName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          {/* User Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName || "User avatar"}
                fill
                className="object-cover"
                sizes="32px"
                unoptimized // Google profile images don't need optimization
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-100">
                <User className="h-4 w-4 text-orange-600" />
              </div>
            )}
          </div>

          {/* User Name - Hidden on mobile */}
          <span className="hidden sm:inline font-medium text-gray-700 max-w-32 truncate">
            {displayName}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {/* <span className="hidden sm:inline ml-2">Sign Out</span> */}
        </Button>
      </div>
    );
  }

  return <Button onClick={signIn}>Sign In with Google</Button>;
}
