import { GET } from "@/app/api/products/route";
import { NextRequest } from "next/server";

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
};

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();
const mockOr = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock("@/lib/utils/api-response", () => ({
  createApiResponse: jest.fn((data, status = 200, message) => {
    const response = {
      json: async () => ({ success: true, data, message }),
      status,
    };
    Object.defineProperty(response, "status", { value: status });
    return response;
  }),
  createApiError: jest.fn((message, status = 400) => {
    const response = {
      json: async () => ({ success: false, error: message }),
      status,
    };
    Object.defineProperty(response, "status", { value: status });
    return response;
  }),
}));

describe("/api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      order: mockOrder,
    });

    mockOrder.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        or: mockOr,
      }),
      range: mockRange,
    });

    mockRange.mockResolvedValue({
      data: mockProducts,
      error: null,
      count: mockProducts.length,
    });

    mockOr.mockReturnValue({
      range: mockRange,
    });
  });

  const mockProducts = [
    {
      id: "1",
      title: "Test Product 1",
      price: 29.99,
      category: "men",
      is_active: true,
      vendors: { id: "v1", name: "Vendor 1", logo_url: null },
    },
    {
      id: "2",
      title: "Test Product 2",
      price: 39.99,
      category: "women",
      is_active: true,
      vendors: { id: "v2", name: "Vendor 2", logo_url: null },
    },
  ];

  test("fetches products with default pagination", async () => {
    const url = "http://localhost:3000/api/products";
    const mockRequest = {
      url,
      nextUrl: new URL(url),
    } as NextRequest;

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("products");
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("vendors"));
    expect(mockEq).toHaveBeenCalledWith("is_active", true);
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mockRange).toHaveBeenCalledWith(0, 11); // Default page 1, limit 12

    expect(data.success).toBe(true);
    expect(data.data.products).toEqual(mockProducts);
  });

  test("applies category filter", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?category=men"
    );

    await GET(request);

    expect(mockEq).toHaveBeenCalledWith("category", "men");
  });

  test("applies search filter", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?search=shirt"
    );

    await GET(request);

    expect(mockOr).toHaveBeenCalledWith(
      "title.ilike.%shirt%, description.ilike.%shirt%"
    );
  });

  test("applies custom pagination", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?page=2&limit=6"
    );

    await GET(request);

    expect(mockRange).toHaveBeenCalledWith(6, 11); // Page 2, limit 6: (2-1)*6 to 6+6-1
  });

  test("handles database error", async () => {
    mockRange.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" },
      count: null,
    });

    const request = new NextRequest("http://localhost:3000/api/products");

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch products");
  });

  test("calculates pagination correctly", async () => {
    // Mock total count query
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          count: 25,
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/products?page=2&limit=10"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasMore: true,
    });
  });

  test('ignores "all" category filter', async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?category=all"
    );

    await GET(request);

    // Should not call eq with category when "all"
    expect(mockEq).toHaveBeenCalledTimes(1); // Only for is_active
    expect(mockEq).toHaveBeenCalledWith("is_active", true);
  });

  test("handles multiple filters combined", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?category=women&search=dress&page=1&limit=8"
    );

    await GET(request);

    expect(mockEq).toHaveBeenCalledWith("is_active", true);
    expect(mockEq).toHaveBeenCalledWith("category", "women");
    expect(mockOr).toHaveBeenCalledWith(
      "title.ilike.%dress%, description.ilike.%dress%"
    );
    expect(mockRange).toHaveBeenCalledWith(0, 7);
  });
});
