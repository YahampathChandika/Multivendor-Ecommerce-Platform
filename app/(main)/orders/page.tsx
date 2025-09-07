// app/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency } from "@/lib/utils/currency";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";

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
  total_amount: number;
  currency: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery?: string;
  order_items: Array<{
    id: string;
    product_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-orange-100 text-orange-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.error || "Failed to load orders");
      }
    } catch (err) {
      setError("Failed to load orders");
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
            <h2 className="text-xl font-semibold">
              Sign in to view your orders
            </h2>
            <p className="text-muted-foreground">
              You need to be signed in to view your order history.
            </p>
            <Button asChild>
              <Link href="/login?redirectTo=/orders">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <OrdersSkeleton />;
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

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground">
              Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/explore">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const orderDate = new Date(order.created_at).toLocaleDateString();

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {orderDate}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Badge
                        className={`${config.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <span className="text-lg font-semibold">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      Items ({order.order_items.length})
                    </h4>
                    <div className="space-y-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">
                              {item.product_title}
                            </p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity} ×{" "}
                              {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <p className="font-medium ml-4">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      ))}

                      {order.order_items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.order_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {(order.shipped_at || order.estimated_delivery) && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {order.shipped_at && (
                          <div>
                            <p className="font-medium">Shipped</p>
                            <p className="text-muted-foreground">
                              {new Date(order.shipped_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {order.estimated_delivery && (
                          <div>
                            <p className="font-medium">
                              {order.status === "delivered"
                                ? "Delivered"
                                : "Estimated Delivery"}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(
                                order.estimated_delivery
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>

                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Reorder
                      </Button>
                    )}

                    {(order.status === "shipped" ||
                      order.status === "processing") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Track Package
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        {orders.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Orders</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
