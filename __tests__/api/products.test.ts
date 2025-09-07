// __tests__/api/products.test.ts
/**
 * @jest-environment jsdom
 */
import { GET } from "../../app/api/products/route";
import { createServerSupabaseClient } from "../../lib/supabase/server";

// Mock Supabase
jest.mock("../../lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

// Mock API response utilities
jest.mock("../../lib/utils/api-response", () => ({
  createApiResponse: jest.fn((data, status = 200, message) => {
    return {
      json: jest.fn().mockResolvedValue({ success: true, data, message }),
      status,
    };
  }),
  createApiError: jest.fn((message, status = 400, error = null) => {
    return {
      json: jest.fn().mockResolvedValue({ success: false, error: message }),
      status,
    };
  }),
}));

// Ensure Request is available
const mockRequest = (url: string, options?: any) => ({
  url,
  method: options?.method || "GET",
  json: jest.fn().mockResolvedValue({}),
  headers: new Map(),
  ...options,
});

describe("/api/products", () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Create proper chaining mock for Supabase
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn(() => mockQuery),
      ...mockQuery,
    };

    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should fetch products successfully", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          title: "Test Shirt",
          price: 29.99,
          category: "Men",
          images: ["image1.jpg"],
          slug: "test-shirt",
          stock: 10,
          is_active: true,
        },
        {
          id: "prod-2",
          title: "Test Jacket",
          price: 59.99,
          category: "Women",
          images: ["image2.jpg"],
          slug: "test-jacket",
          stock: 5,
          is_active: true,
        },
      ];

      // Mock the chain: from().select().eq().order().range() returning data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
                count: 2,
              }),
            }),
          }),
        }),
      });

      const request = mockRequest("http://localhost:3000/api/products");
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual(mockProducts);
      expect(result.data.pagination.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
    });

    it("should handle category filter", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          title: "Men's Shirt",
          price: 29.99,
          category: "Men",
          images: ["image1.jpg"],
          slug: "mens-shirt",
          stock: 10,
          is_active: true,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      });

      const request = mockRequest(
        "http://localhost:3000/api/products?category=Men"
      );
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual(mockProducts);
    });

    it("should handle search query", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          title: "Blue Shirt",
          price: 29.99,
          category: "Men",
          images: ["image1.jpg"],
          slug: "blue-shirt",
          stock: 10,
          is_active: true,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                range: jest.fn().mockResolvedValue({
                  data: mockProducts,
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      });

      const request = mockRequest(
        "http://localhost:3000/api/products?search=shirt"
      );
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual(mockProducts);
    });

    it("should handle price range filter", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          title: "Affordable Shirt",
          price: 25.99,
          category: "Men",
          images: ["image1.jpg"],
          slug: "affordable-shirt",
          stock: 10,
          is_active: true,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  range: jest.fn().mockResolvedValue({
                    data: mockProducts,
                    error: null,
                    count: 1,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const request = mockRequest(
        "http://localhost:3000/api/products?minPrice=20&maxPrice=30"
      );
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual(mockProducts);
    });

    it("should handle pagination", async () => {
      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: `prod-${i + 1}`,
        title: `Product ${i + 1}`,
        price: 29.99,
        category: "Men",
        images: [`image${i + 1}.jpg`],
        slug: `product-${i + 1}`,
        stock: 10,
        is_active: true,
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockProducts.slice(0, 3), // First 3 items
                error: null,
                count: 5, // Total count
              }),
            }),
          }),
        }),
      });

      const request = mockRequest(
        "http://localhost:3000/api/products?page=1&limit=3"
      );
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(3);
      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 3,
        total: 5,
        pages: 2,
      });
    });

    it("should handle database error", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
                count: null,
              }),
            }),
          }),
        }),
      });

      const request = mockRequest("http://localhost:3000/api/products");
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch products");
      expect(response.status).toBe(500);
    });

    it("should handle empty results", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
              }),
            }),
          }),
        }),
      });

      const request = mockRequest("http://localhost:3000/api/products");
      const response = await GET(request as any);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual([]);
      expect(result.data.pagination.total).toBe(0);
    });
  });
});
