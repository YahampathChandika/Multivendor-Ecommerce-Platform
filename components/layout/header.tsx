// components/layout/header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Settings,
  X,
} from "lucide-react";

export function Header() {
  const { user, isAuthenticated, signOut, signIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock cart count - you'll implement this with cart store later
  const cartItemsCount = 0;

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  // Initialize search query from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Real-time search - update URL as user types with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pathname === "/explore") {
        const params = new URLSearchParams(searchParams.toString());

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        } else {
          params.delete("search");
        }

        const newUrl = params.toString()
          ? `/explore?${params.toString()}`
          : "/explore";
        router.push(newUrl, { scroll: false });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, pathname, router, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to explore page if not already there
    if (pathname !== "/explore") {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      router.push(`/explore?${params.toString()}`);
    }
    setShowMobileSearch(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  return (
    <>
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

            {/* Center - Desktop Navigation & Search */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation */}
              <nav className="flex items-center space-x-8">
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
                    pathname === "/explore"
                      ? "text-orange-500"
                      : "text-gray-700"
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
            </div>

            {/* Right - User Actions */}
            <div className="flex items-center space-x-3">
              {/* Desktop Search */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:flex">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10 w-64 h-9"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </form>
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-700 hover:text-orange-500"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>

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
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
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

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-16 z-40 mobile-search-overlay">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 w-full"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
