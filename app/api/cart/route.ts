// app/api/cart/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { withAuth } from "@/lib/utils/auth-middleware";
import { NextRequest } from "next/server";

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  return (
    await withAuth(async (user) => {
      const supabase = await createServerSupabaseClient();

      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(
          `
        *,
        products (
          id,
          title,
          price,
          images,
          stock,
          slug
        )
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return createApiError("Failed to fetch cart", 500, error);
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      );
      const totalItems = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return createApiResponse({
        items: cartItems,
        summary: {
          subtotal,
          totalItems,
          currency: "USD",
        },
      });
    })
  )(request);
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  return (
    await withAuth(async (user) => {
      const supabase = await createServerSupabaseClient();
      const body = await request.json();

      const { product_id, quantity, selected_size, selected_color } = body;

      // Validate required fields
      if (!product_id || !quantity || quantity <= 0) {
        return createApiError("Invalid request data", 400);
      }

      // Get product details for current price
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("price, stock, is_active")
        .eq("id", product_id)
        .single();

      if (productError || !product || !product.is_active) {
        return createApiError("Product not found", 404);
      }

      // Check stock availability
      if (product.stock < quantity) {
        return createApiError("Insufficient stock", 400);
      }

      try {
        // Try to update existing cart item or insert new one
        const { data: cartItem, error } = await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              product_id,
              quantity,
              selected_size,
              selected_color,
              unit_price: product.price,
            },
            {
              onConflict: "user_id,product_id,selected_size,selected_color",
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (error) {
          return createApiError("Failed to add to cart", 500, error);
        }

        return createApiResponse(cartItem, 201, "Item added to cart");
      } catch (error) {
        return createApiError("Failed to add to cart", 500, error);
      }
    })
  )(request);
}
