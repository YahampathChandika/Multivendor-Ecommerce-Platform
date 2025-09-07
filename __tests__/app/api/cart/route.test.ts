// __tests__/app/api/cart/route.test.ts
import { GET, POST } from "../../../../app/api/cart/route";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";
import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("../../../../lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

// Mock auth middleware
jest.mock("../../../../lib/utils/auth-middleware", () => ({
  withAuth: (handler: any) => (request: NextRequest) => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };
    return handler(mockUser, request);
  },
}));

// Mock API response utilities
jest.mock("../../../../lib/utils/api-response", () => ({
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

describe("/api/cart", () => {
  let mockSupabase: any;
  let mockRequest: any;

  beforeEach(() => {
    // Create proper chaining mock for Supabase
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn().mockReturnThis(),
    };

    mockSupabase = {
      from: jest.fn(() => mockQuery),
      ...mockQuery,
    };

    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);

    mockRequest = {
      json: jest.fn(),
      url: "http://localhost:3000/api/cart",
    };

    jest.clearAllMocks();
  });

  describe("GET /api/cart", () => {
    it("should fetch user cart with totals correctly", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          quantity: 2,
          unit_price: 29.99,
          products: {
            id: "prod-1",
            title: "Test Shirt",
            price: 29.99,
            images: ["image1.jpg"],
            stock: 10,
            slug: "test-shirt",
          },
        },
        {
          id: "cart-2",
          quantity: 1,
          unit_price: 59.99,
          products: {
            id: "prod-2",
            title: "Test Jacket",
            price: 59.99,
            images: ["image2.jpg"],
            stock: 5,
            slug: "test-jacket",
          },
        },
      ];

      // Mock the chain: from().select().eq().order() returning data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          }),
        }),
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockCartItems);
      expect(result.data.summary).toEqual({
        subtotal: 119.97, // (29.99 * 2) + (59.99 * 1)
        totalItems: 3, // 2 + 1
        currency: "USD",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("cart_items");
    });

    it("should handle empty cart", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(result.data.summary).toEqual({
        subtotal: 0,
        totalItems: 0,
        currency: "USD",
      });
    });

    it("should handle database error", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch cart");
      expect(response.status).toBe(500);
    });

    it("should calculate totals with decimal precision", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          quantity: 3,
          unit_price: 15.33,
          products: {
            id: "prod-1",
            title: "Item 1",
            price: 15.33,
            images: [],
            stock: 10,
            slug: "item-1",
          },
        },
        {
          id: "cart-2",
          quantity: 2,
          unit_price: 22.67,
          products: {
            id: "prod-2",
            title: "Item 2",
            price: 22.67,
            images: [],
            stock: 5,
            slug: "item-2",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          }),
        }),
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.summary.subtotal).toBe(91.33); // (15.33 * 3) + (22.67 * 2)
      expect(result.data.summary.totalItems).toBe(5);
    });
  });

  describe("POST /api/cart", () => {
    it("should add new item to cart successfully", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 2,
        selected_size: "M",
        selected_color: "Blue",
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      // Mock product check
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    price: 29.99,
                    stock: 10,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "cart_items") {
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: "cart-1",
                    user_id: "user-123",
                    product_id: "prod-1",
                    quantity: 2,
                    selected_size: "M",
                    selected_color: "Blue",
                    unit_price: 29.99,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        return mockSupabase;
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Item added to cart");
    });

    it("should handle inactive product", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                price: 29.99,
                stock: 10,
                is_active: false, // Product is inactive
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Product not found or inactive");
      expect(response.status).toBe(404);
    });

    it("should check stock availability", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 15, // More than available stock
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                price: 29.99,
                stock: 10, // Only 10 in stock
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient stock available");
      expect(response.status).toBe(400);
    });

    it("should handle upsert conflict correctly", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      // Mock product check success
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    price: 29.99,
                    stock: 10,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "cart_items") {
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: "cart-1",
                    user_id: "user-123",
                    product_id: "prod-1",
                    quantity: 2, // Updated quantity (1 existing + 1 new)
                    unit_price: 29.99,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        return mockSupabase;
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(2);
    });

    it("should handle database error during upsert", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    price: 29.99,
                    stock: 10,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "cart_items") {
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database constraint violation" },
                }),
              }),
            }),
          };
        }

        return mockSupabase;
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to add to cart");
      expect(response.status).toBe(500);
    });

    it("should handle optional size and color parameters", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
        // No size or color specified
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    price: 29.99,
                    stock: 10,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "cart_items") {
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: "cart-1",
                    user_id: "user-123",
                    product_id: "prod-1",
                    quantity: 1,
                    selected_size: undefined,
                    selected_color: undefined,
                    unit_price: 29.99,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        return mockSupabase;
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
    });
  });
});
