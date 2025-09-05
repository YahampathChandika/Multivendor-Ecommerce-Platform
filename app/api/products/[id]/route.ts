// app/api/products/[id]/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Try to fetch by ID first, then by slug
    let query = supabase
      .from("products")
      .select(
        `
        *,
        vendors (
          id,
          name,
          email,
          description,
          logo_url
        )
      `
      )
      .eq("is_active", true);

    // Check if ID is a UUID (for direct ID lookup) or slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      );

    if (isUUID) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data: product, error } = await query.single();

    if (error || !product) {
      return createApiError("Product not found", 404);
    }

    return createApiResponse(product);
  } catch (error) {
    return createApiError("Internal server error", 500, error);
  }
}
