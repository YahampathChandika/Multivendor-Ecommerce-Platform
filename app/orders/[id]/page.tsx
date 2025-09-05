// app/orders/[id]/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  CreditCard,
  Download,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: string;
  product_title: string;
  selected_size?: string;
  selected_color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    id: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  order_number: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_method?: string;
  shipping_address: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  tracking_number?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery?: string;
  order_items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    description: "Your order is being processed",
  },
  paid: {
    label: "Paid",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
    description: "Payment received successfully",
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Package,
    description: "Your order is being prepared",
  },
  shipped: {
    label: "Shipped",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Truck,
    description: "Your order is on its way",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    description: "Your order has been delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
    description: "This order was cancelled",
  },
};

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || "Failed to load order");
      }
    } catch (err) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Sign in to view order</h2>
            <p className="text-muted-foreground">
              You need to be signed in to view order details.
            </p>
            <Button asChild>
              <Link href={`/login?redirectTo=/orders/${orderId}`}>Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Order not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const orderDate = new Date(order.created_at).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Success Banner */}
        {isSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Your order has been placed successfully! You'll receive an
              email confirmation shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Orders</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Order #{order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {orderDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${config.color} px-3 py-1.5 text-sm font-medium flex items-center gap-2`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </Badge>
                  <p className="text-muted-foreground">{config.description}</p>
                </div>

                {/* Tracking Info */}
                {order.tracking_number && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Tracking Number
                      </span>
                    </div>
                    <p className="text-blue-800 font-mono text-sm">
                      {order.tracking_number}
                    </p>
                  </div>
                )}

                {/* Delivery Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {order.shipped_at && (
                    <div>
                      <p className="font-medium text-sm">Shipped</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(order.shipped_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {order.estimated_delivery && (
                    <div>
                      <p className="font-medium text-sm">
                        {order.status === "delivered"
                          ? "Delivered"
                          : "Expected Delivery"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(
                          order.estimated_delivery
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.order_items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items.map((item) => {
                  const images = item.products
                    ? ensureArray<string>(item.products.images)
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {images[0] ? (
                            <Image
                              src={images[0]}
                              alt={item.product_title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {item.products?.slug ? (
                              <Link
                                href={`/products/${item.products.slug}`}
                                className="font-medium hover:text-orange-500 transition-colors line-clamp-2"
                              >
                                {item.product_title}
                              </Link>
                            ) : (
                              <p className="font-medium line-clamp-2">
                                {item.product_title}
                              </p>
                            )}

                            {/* Variants */}
                            <div className="flex flex-wrap gap-2 mt-1">
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

                            <p className="text-sm text-muted-foreground mt-1">
                              Qty: {item.quantity} ×{" "}
                              {formatCurrency(item.unit_price)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(item.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shipping_address.fullName}
                  </p>
                  <p>{order.shipping_address.addressLine1}</p>
                  {order.shipping_address.addressLine2 && (
                    <p>{order.shipping_address.addressLine2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postalCode}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="text-muted-foreground">
                      Phone: {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {order.shipping_cost === 0
                        ? "Free"
                        : formatCurrency(order.shipping_cost, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      {formatCurrency(order.tax_amount, order.currency)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>
                      {formatCurrency(order.total_amount, order.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span className="capitalize">
                      {order.payment_method || "Credit Card"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge
                      variant={
                        order.status === "paid" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.status === "delivered" && (
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reorder Items
                  </Button>
                )}

                {(order.status === "shipped" ||
                  order.status === "processing") && (
                  <Button variant="outline" className="w-full">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Package
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/explore">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <h3 className="font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our customer support team
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent />
    </Suspense>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
