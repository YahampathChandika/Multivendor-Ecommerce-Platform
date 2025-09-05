// app/api/cart/[id]/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { withAuth } from "@/lib/utils/auth-middleware";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update cart item quantity
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return (
    await withAuth(async (user) => {
      const { id } = await params;
      const supabase = await createServerSupabaseClient();
      const body = await request.json();

      const { quantity } = body;

      // Validate quantity
      if (!quantity || quantity < 1) {
        return createApiError("Invalid quantity", 400);
      }

      try {
        // Update cart item quantity
        const { data: cartItem, error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", id)
          .eq("user_id", user.id) // Ensure user owns this cart item
          .select()
          .single();

        if (error || !cartItem) {
          return createApiError("Cart item not found", 404);
        }

        return createApiResponse(cartItem, 200, "Cart item updated");
      } catch (error) {
        return createApiError("Failed to update cart item", 500, error);
      }
    })
  )(request);
}

// DELETE - Remove cart item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return (
    await withAuth(async (user) => {
      const { id } = await params;
      const supabase = await createServerSupabaseClient();

      try {
        // Delete cart item
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id); // Ensure user owns this cart item

        if (error) {
          return createApiError("Failed to remove cart item", 500, error);
        }

        return createApiResponse(null, 200, "Cart item removed");
      } catch (error) {
        return createApiError("Failed to remove cart item", 500, error);
      }
    })
  )(request);
}
