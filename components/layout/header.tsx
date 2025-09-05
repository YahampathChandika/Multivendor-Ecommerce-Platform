// components/layout/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/lib/hooks/use-auth";
import { ShoppingCart, Menu, X, Search, Heart, User, Package } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Men", href: "/explore?category=men" },
  { name: "Women", href: "/explore?category=women" },
  { name: "Kids", href: "/explore?category=kids" },
];

export function Header() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock cart count - you'll implement this with cart store later
  const cartItemsCount = 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FH</span>
              </div>
              <span className="hidden sm:block font-bold text-xl">
                FashionHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href.includes("category") && pathname === "/explore");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                    isActive ? "text-orange-500" : "text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="text-gray-700">
              <Search className="h-4 w-4" />
            </Button>

            {/* Authenticated User Actions */}
            {isAuthenticated && (
              <>
                {/* Wishlist */}
                <Button variant="ghost" size="sm" className="text-gray-700">
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 relative"
                  asChild
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemsCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {/* Orders */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                  asChild
                >
                  <Link href="/orders">
                    <Package className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            {/* Auth Button */}
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors ${
                      isActive
                        ? "text-orange-500 bg-orange-50"
                        : "text-gray-700 hover:text-orange-500 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Actions */}
              <div className="border-t pt-4 mt-4 space-y-2">
                {isAuthenticated && (
                  <>
                    <Link
                      href="/cart"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      Cart
                      {cartItemsCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      My Orders
                    </Link>
                  </>
                )}

                <div className="px-3 py-2">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

