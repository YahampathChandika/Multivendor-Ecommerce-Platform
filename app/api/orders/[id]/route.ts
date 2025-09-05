// app/api/orders/[id]/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { withAuth } from "@/lib/utils/auth-middleware";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single order details
export async function GET(request: NextRequest, { params }: RouteParams) {
  return (
    await withAuth(async (user) => {
      const { id } = await params;
      const supabase = await createServerSupabaseClient();

      try {
        const { data: order, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (
              id,
              product_id,
              product_title,
              selected_size,
              selected_color,
              quantity,
              unit_price,
              total_price,
              products (
                id,
                slug,
                images
              )
            )
          `
          )
          .eq("id", id)
          .eq("user_id", user.id) // Ensure user owns this order
          .single();

        if (error || !order) {
          return createApiError("Order not found", 404);
        }

        return createApiResponse(order);
      } catch (error) {
        return createApiError("Internal server error", 500, error);
      }
    })
  )(request);
}
