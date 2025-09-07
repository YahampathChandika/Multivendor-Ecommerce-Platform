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

describe("/api/cart", () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    };

    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);

    mockRequest = {
      json: jest.fn(),
      url: "http://localhost:3000/api/cart",
    } as any;

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

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
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

      // Verify correct query was made
      expect(mockSupabase.from).toHaveBeenCalledWith("cart_items");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should handle empty cart", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
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
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection failed" },
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

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.summary.subtotal).toBeCloseTo(91.33, 2); // (15.33 * 3) + (22.67 * 2)
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

      // Mock product lookup
      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10,
          is_active: true,
        },
        error: null,
      });

      const mockCartItem = {
        id: "cart-1",
        user_id: "user-123",
        product_id: "prod-1",
        quantity: 2,
        selected_size: "M",
        selected_color: "Blue",
        unit_price: 29.99,
      };

      mockSupabase.upsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCartItem,
            error: null,
          }),
        }),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCartItem);
      expect(result.message).toBe("Item added to cart");
      expect(response.status).toBe(201);

      // Verify product was looked up
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "prod-1");

      // Verify upsert was called with correct data
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          product_id: "prod-1",
          quantity: 2,
          selected_size: "M",
          selected_color: "Blue",
          unit_price: 29.99,
        },
        {
          onConflict: "user_id,product_id,selected_size,selected_color",
          ignoreDuplicates: false,
        }
      );
    });

    it("should validate required fields", async () => {
      const invalidRequestBody = {
        product_id: "prod-1",
        // missing quantity
        selected_size: "M",
      };

      mockRequest.json = jest.fn().mockResolvedValue(invalidRequestBody);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid request data");
      expect(response.status).toBe(400);
    });

    it("should validate positive quantity", async () => {
      const invalidRequestBody = {
        product_id: "prod-1",
        quantity: 0, // invalid quantity
        selected_size: "M",
      };

      mockRequest.json = jest.fn().mockResolvedValue(invalidRequestBody);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid request data");
      expect(response.status).toBe(400);
    });

    it("should handle product not found", async () => {
      const requestBody = {
        product_id: "non-existent",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }, // Not found
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Product not found");
      expect(response.status).toBe(404);
    });

    it("should handle inactive product", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10,
          is_active: false, // Product is inactive
        },
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Product not found");
      expect(response.status).toBe(404);
    });

    it("should check stock availability", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 15, // More than available stock
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10, // Only 10 in stock
          is_active: true,
        },
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient stock");
      expect(response.status).toBe(400);
    });

    it("should handle upsert conflict correctly", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
        selected_size: "M",
        selected_color: "Blue",
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10,
          is_active: true,
        },
        error: null,
      });

      // Existing cart item should be updated, not duplicated
      const updatedCartItem = {
        id: "cart-1",
        user_id: "user-123",
        product_id: "prod-1",
        quantity: 1, // Updated quantity
        selected_size: "M",
        selected_color: "Blue",
        unit_price: 29.99,
      };

      mockSupabase.upsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: updatedCartItem,
            error: null,
          }),
        }),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedCartItem);

      // Verify upsert uses the correct conflict resolution
      expect(mockSupabase.upsert).toHaveBeenCalledWith(expect.any(Object), {
        onConflict: "user_id,product_id,selected_size,selected_color",
        ignoreDuplicates: false,
      });
    });

    it("should handle database error during upsert", async () => {
      const requestBody = {
        product_id: "prod-1",
        quantity: 1,
      };

      mockRequest.json = jest.fn().mockResolvedValue(requestBody);

      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10,
          is_active: true,
        },
        error: null,
      });

      mockSupabase.upsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database constraint violation" },
          }),
        }),
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

      mockSupabase.select.mockResolvedValueOnce({
        data: {
          price: 29.99,
          stock: 10,
          is_active: true,
        },
        error: null,
      });

      const mockCartItem = {
        id: "cart-1",
        user_id: "user-123",
        product_id: "prod-1",
        quantity: 1,
        selected_size: undefined,
        selected_color: undefined,
        unit_price: 29.99,
      };

      mockSupabase.upsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCartItem,
            error: null,
          }),
        }),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          selected_size: undefined,
          selected_color: undefined,
        }),
        expect.any(Object)
      );
    });
  });
});
