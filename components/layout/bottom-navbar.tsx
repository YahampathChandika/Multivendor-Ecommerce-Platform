// components/layout/bottom-navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Home, Search, Box, ShoppingBag } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  showBadge?: boolean;
  badgeCount?: number;
}

export function BottomNavbar() {
  const pathname = usePathname();

  // Mock cart count - you'll implement this with cart store later
  const cartItemsCount = 0;

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "search",
      label: "Search",
      href: "/explore",
      icon: Search,
    },
    {
      id: "cart",
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      showBadge: cartItemsCount > 0,
      badgeCount: cartItemsCount,
    },
    {
      id: "products",
      label: "Products",
      href: "/explore",
      icon: Box,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 safe-area-padding-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative ${
                active
                  ? "text-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badgeCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>

              {/* Active indicator dot */}
              {active && (
                <div className="absolute bottom-0 w-1 h-1 bg-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
