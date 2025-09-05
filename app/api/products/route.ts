// app/api/products/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createApiResponse, createApiError } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search");

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from("products")
      .select(
        `
        *,
        vendors (
          id,
          name,
          logo_url
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%, description.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      return createApiError("Failed to fetch products", 500, error);
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    return createApiResponse({
      products,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore: page * limit < (totalCount || 0),
      },
    });
  } catch (error) {
    return createApiError("Internal server error", 500, error);
  }
}
