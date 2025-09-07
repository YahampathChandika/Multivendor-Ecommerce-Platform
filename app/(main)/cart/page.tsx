// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency } from "@/lib/utils/currency";
import { ensureArray } from "@/lib/utils/array";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  unit_price: number;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock: number;
    slug: string;
  };
}

interface CartSummary {
  subtotal: number;
  totalItems: number;
  currency: string;
}

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    totalItems: 0,
    currency: "USD",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      const result = await response.json();

      if (result.success) {
        setCartItems(result.data.items);
        setCartSummary(result.data.summary);
      } else {
        setError(result.error || "Failed to load cart");
      }
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchCart(); // Refresh cart
      } else {
        setError(result.error || "Failed to update quantity");
      }
    } catch (err) {
      setError("Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchCart(); // Refresh cart
      } else {
        setError(result.error || "Failed to remove item");
      }
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Sign in to view your cart</h2>
            <p className="text-muted-foreground">
              You need to be signed in to add items to your cart and make
              purchases.
            </p>
            <Button asChild>
              <Link href="/login?redirectTo=/cart">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some items to your cart to get started.
            </p>
            <Button asChild>
              <Link href="/explore">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shippingCost = cartSummary.subtotal >= 100 ? 0 : 12;
  const taxAmount = cartSummary.subtotal * 0.08;
  const totalAmount = cartSummary.subtotal + shippingCost + taxAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Cart</h1>
            <p className="text-sm text-muted-foreground">
              {cartSummary.totalItems}{" "}
              {cartSummary.totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const images = ensureArray<string>(item.products.images);
              const isUpdating = updatingItems.has(item.id);
              const itemTotal = item.quantity * item.unit_price;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    {/* Changed to always use flex-row layout for consistent horizontal layout */}
                    <div className="flex flex-row gap-4">
                      {/* Product Image - Fixed size for consistent layout */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={images[0] || "/placeholder-product.jpg"}
                            alt={item.products.title}
                            fill
                            className="object-contain" // Changed from object-cover to object-contain
                            sizes="(max-width: 640px) 80px, 96px"
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-3">
                          {/* Product Title and Variants */}
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.products.slug}`}
                              className="font-medium text-sm sm:text-base hover:text-orange-500 transition-colors line-clamp-2 block"
                            >
                              {item.products.title}
                            </Link>

                            {/* Variants */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.selected_size && (
                                <Badge variant="outline" className="text-xs">
                                  Size: {item.selected_size}
                                </Badge>
                              )}
                              {item.selected_color && (
                                <Badge variant="outline" className="text-xs">
                                  Color: {item.selected_color}
                                </Badge>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mt-2">
                              <span className="text-lg font-semibold">
                                {formatCurrency(itemTotal)}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {formatCurrency(item.unit_price)} each
                              </span>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={isUpdating || item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  isUpdating ||
                                  item.quantity >= item.products.stock
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              disabled={isUpdating}
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>{formatCurrency(cartSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0
                        ? "Free"
                        : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {shippingCost > 0 && (
                  <div className="text-xs text-muted-foreground bg-orange-50 p-3 rounded-lg">
                    Add {formatCurrency(100 - cartSummary.subtotal)} more for
                    free shipping
                  </div>
                )}

                <Button asChild className="w-full bg-orange-500 rounded-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="outline" asChild className="w-full rounded-full">
                  <Link href="/explore">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
