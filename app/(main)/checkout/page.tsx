// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency } from "@/lib/utils/currency";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Lock,
  Check,
  AlertCircle,
  Truck,
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
    slug: string;
  };
}

interface CartSummary {
  subtotal: number;
  totalItems: number;
  currency: string;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit/Debit Card",
    logo: "https://1000logos.net/wp-content/uploads/2017/06/VISA-Logo.jpg",
  },
  {
    id: "apple",
    name: "Apple Pay",
    logo: "https://download.logo.wine/logo/Apple_Pay/Apple_Pay-Logo.wine.png",
  },
  {
    id: "google",
    name: "Google Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png",
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png",
  },
];

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    totalItems: 0,
    currency: "USD",
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

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

        // Redirect to cart if empty
        if (result.data.items.length === 0) {
          router.push("/cart");
        }
      } else {
        setError(result.error || "Failed to load cart");
      }
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !shippingAddress.fullName ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.postalCode
      ) {
        throw new Error("Please fill in all required shipping address fields");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          payment_method: selectedPaymentMethod,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to order confirmation
        router.push(`/orders/${result.data.id}?success=true`);
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Sign in to checkout</h2>
            <p className="text-muted-foreground">
              You need to be signed in to complete your purchase.
            </p>
            <Button asChild>
              <Link href="/login?redirectTo=/checkout">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (error && cartItems.length === 0) {
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

  const shippingCost = cartSummary.subtotal >= 100 ? 0 : 12;
  const taxAmount = cartSummary.subtotal * 0.08;
  const totalAmount = cartSummary.subtotal + shippingCost + taxAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground">
              Complete your purchase
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Address Line 1 *
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.addressLine1}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            addressLine1: e.target.value,
                          }))
                        }
                        placeholder="Street address"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Address Line 2
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.addressLine2}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            addressLine2: e.target.value,
                          }))
                        }
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City *
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="City"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State/Province *
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        placeholder="State/Province"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Postal Code *
                      </label>
                      <Input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            postalCode: e.target.value,
                          }))
                        }
                        placeholder="ZIP/Postal code"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Phone number (optional)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPaymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={method.logo}
                            alt={method.name}
                            className="h-8 w-8 object-contain rounded"
                          />
                          <span className="font-medium">{method.name}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-orange-500 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Payment Form Simulation */}
                  {selectedPaymentMethod === "card" && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Payment processing is simulated for this demo
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="**** **** **** 1234" disabled />
                        <Input placeholder="MM/YY" disabled />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {item.products.title}
                          </p>
                          <p className="text-muted-foreground">
                            Qty: {item.quantity}
                            {item.selected_size && ` • ${item.selected_size}`}
                            {item.selected_color && ` • ${item.selected_color}`}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    ))}

                    {cartItems.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{cartItems.length - 3} more items
                      </p>
                    )}
                  </div>

                  <hr />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartSummary.totalItems} items)</span>
                      <span>{formatCurrency(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Shipping
                      </span>
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

                  {/* Delivery Info */}
                  <div className="text-xs text-muted-foreground bg-green-50 p-3 rounded-lg flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Delivered in next 7 days</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 rounded-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Pay Now"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your payment information is secure and encrypted
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
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
