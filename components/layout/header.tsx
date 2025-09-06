// components/layout/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Search,
  User,
  LogOut,
  ChevronDown,
  LayoutGrid,
  Home,
  Box,
  ShoppingBag,
} from "lucide-react";

export function Header() {
  const { user, isAuthenticated, signOut, signIn } = useAuth();
  const pathname = usePathname();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Mock cart count - you'll implement this with cart store later
  const cartItemsCount = 0;

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left - Logo/Menu Icon */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              {/* Custom logo icon matching the design */}
              <LayoutGrid className="h-6 w-6 text-gray-700" />
              <span className="hidden md:flex font-semibold text-2xl text-orange-600">
                FashionHub
              </span>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/"
              className={`flex items-center text-sm font-medium transition-colors hover:text-orange-500 ${
                pathname === "/" ? "text-orange-500" : "text-gray-700"
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <Link
              href="/explore"
              className={`flex items-center text-sm font-medium transition-colors hover:text-orange-500 ${
                pathname === "/explore" ? "text-orange-500" : "text-gray-700"
              }`}
            >
              <Box className="h-4 w-4 mr-2" />
              Products
            </Link>
            <Link
              href="/cart"
              className={`flex items-center text-sm font-medium transition-colors hover:text-orange-500 ${
                pathname === "/cart" ? "text-orange-500" : "text-gray-700"
              }`}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Cart
            </Link>
          </nav>

          {/* Right - User Actions */}
          <div className="flex items-center space-x-3">
            {/* Desktop Search & Cart */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-orange-500"
                asChild
              >
                <Link href="/explore">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* User Avatar/Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName || "User avatar"}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-100">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden md:block" />
                </button>

                {/* Dropdown */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={signIn}
                className="text-gray-700 hover:text-orange-500"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
