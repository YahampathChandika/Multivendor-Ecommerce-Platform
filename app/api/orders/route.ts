// app/api/orders/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { withAuth } from "@/lib/utils/auth-middleware";
import { NextRequest } from "next/server";
import type { ShippingAddress } from "@/lib/types/database";

// GET - Fetch user's orders
export async function GET(request: NextRequest) {
  return (
    await withAuth(async (user) => {
      const supabase = await createServerSupabaseClient();
      const { searchParams } = new URL(request.url);

      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      try {
        const { data: orders, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (
              id,
              product_title,
              selected_size,
              selected_color,
              quantity,
              unit_price,
              total_price
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          return createApiError("Failed to fetch orders", 500, error);
        }

        return createApiResponse(orders);
      } catch (error) {
        return createApiError("Internal server error", 500, error);
      }
    })
  )(request);
}

// POST - Create new order from cart
export async function POST(request: NextRequest) {
  return (
    await withAuth(async (user) => {
      const supabase = await createServerSupabaseClient();
      const body = await request.json();

      const { shipping_address, payment_method } = body;

      // Validate required fields
      if (!shipping_address || !shipping_address.fullName || !shipping_address.addressLine1) {
        return createApiError("Invalid shipping address", 400);
      }

      try {
        // Start transaction by getting cart items
        const { data: cartItems, error: cartError } = await supabase
          .from("cart_items")
          .select(
            `
            *,
            products (
              id,
              title,
              price,
              stock
            )
          `
          )
          .eq("user_id", user.id);

        if (cartError || !cartItems || cartItems.length === 0) {
          return createApiError("Cart is empty", 400);
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = cartItems.map((item) => {
          const itemTotal = item.quantity * item.unit_price;
          subtotal += itemTotal;
          
          return {
            product_id: item.product_id,
            product_title: item.products.title,
            selected_size: item.selected_size,
            selected_color: item.selected_color,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: itemTotal,
          };
        });

        const shippingCost = subtotal >= 100 ? 0 : 12;
        const taxAmount = subtotal * 0.08;
        const totalAmount = subtotal + shippingCost + taxAmount;

        // Generate order number
        const { data: orderNumberResult } = await supabase
          .rpc('generate_order_number');
        
        const orderNumber = orderNumberResult || `ORD-${Date.now()}`;

        // Create order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            user_id: user.id,
            shipping_address: shipping_address as ShippingAddress,
            subtotal,
            shipping_cost: shippingCost,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: "paid", // Simulate successful payment
            payment_method,
            payment_status: "completed",
            estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          })
          .select()
          .single();

        if (orderError || !order) {
          return createApiError("Failed to create order", 500, orderError);
        }

        // Create order items
        const orderItemsWithOrderId = orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsWithOrderId);

        if (itemsError) {
          // Rollback order creation if items insertion fails
          await supabase.from("orders").delete().eq("id", order.id);
          return createApiError("Failed to create order items", 500, itemsError);
        }

        // Clear cart after successful order creation
        const { error: clearCartError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);

        if (clearCartError) {
          console.error("Failed to clear cart:", clearCartError);
          // Don't fail the order creation if cart clearing fails
        }

        return createApiResponse(order, 201, "Order created successfully");
      } catch (error) {
        return createApiError("Failed to create order", 500, error);
      }
    })
  )(request);
}