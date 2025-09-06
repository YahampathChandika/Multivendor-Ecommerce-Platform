"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  User,
  Bell,
  MapPin,
  CreditCard,
  Package,
  Heart,
  HelpCircle,
  Star,
  ArrowLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  Mail,
  Phone,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

// Mock data for addresses and payment methods
const mockAddresses = [
  {
    id: "1",
    label: "Home",
    name: "John Doe",
    address: "123 Main Street, Apt 4B",
    city: "New York, NY 10001",
    isDefault: true,
  },
  {
    id: "2",
    label: "Work",
    name: "John Doe",
    address: "456 Business Ave, Suite 100",
    city: "New York, NY 10005",
    isDefault: false,
  },
];

const mockPaymentMethods = [
  {
    id: "1",
    type: "Visa",
    last4: "1234",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "2",
    type: "Mastercard",
    last4: "5678",
    expiry: "08/25",
    isDefault: false,
  },
];

export default function SettingsPage() {
  const { user, isAuthenticated, signOut, loading, initialized } = useAuth();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  if (!initialized || loading) {
    return <SettingsSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <User className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">
              Sign in to access settings
            </h2>
            <p className="text-muted-foreground">
              You need to be signed in to manage your account settings.
            </p>
            <Button asChild>
              <Link href="/login?redirectTo=/settings">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name;
  const email = user?.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 flex-shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName || "User avatar"}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized // Google profile images don't need optimization
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="text-xl font-semibold">
                    {displayName || "User"}
                  </h3>
                  <p className="text-muted-foreground">{email}</p>
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about order status
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.orderUpdates}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        orderUpdates: e.target.checked,
                      }))
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Promotions</p>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.promotions}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        promotions: e.target.checked,
                      }))
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Addresses */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Addresses
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAddresses.map((address) => (
                <div
                  key={address.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border rounded-lg space-y-3 sm:space-y-0 sm:space-x-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{address.label}</p>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-start">
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPaymentMethods.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">
                          {payment.type} •••• {payment.last4}
                        </p>
                        {payment.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {payment.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-5 w-20 mx-auto sm:mx-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center space-y-2">
                  <Skeleton className="h-6 w-6 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Other sections skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
