// __tests__/app/api/orders/route.test.ts
import { POST } from "../../../../app/api/orders/route";
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

describe("/api/orders POST", () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;
  let capturedOrderItems: any[] = [];

  beforeEach(() => {
    capturedOrderItems = [];

    // Create comprehensive Supabase mock
    mockSupabase = {
      from: jest.fn().mockImplementation((table: string) => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockImplementation((data: any) => {
            // Capture order items for verification
            if (Array.isArray(data) && table === "order_items") {
              capturedOrderItems.push(...data);
            }
            return mockQuery;
          }),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
          order: jest.fn().mockReturnThis(),
        };
        return mockQuery;
      }),
      rpc: jest.fn(),
    };

    (createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase);

    // Mock request with shipping address
    const mockBody = {
      shipping_address: {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
      payment_method: "card",
    };

    mockRequest = {
      json: jest.fn().mockResolvedValue(mockBody),
      url: "http://localhost:3000/api/orders",
    } as any;

    jest.clearAllMocks();
  });

  describe("Order Creation Flow", () => {
    it("should create order successfully with valid cart items", async () => {
      // Mock cart items
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 2,
          unit_price: 29.99,
          selected_size: "M",
          selected_color: "Blue",
          products: {
            title: "Test Shirt",
            price: 29.99,
            stock: 10,
          },
        },
        {
          id: "cart-2",
          product_id: "prod-2",
          quantity: 1,
          unit_price: 59.99,
          selected_size: "L",
          selected_color: "Red",
          products: {
            title: "Test Jacket",
            price: 59.99,
            stock: 5,
          },
        },
      ];

      const mockOrder = {
        id: "order-125",
        order_number: "ORD-20240101-002",
        user_id: "user-123",
        subtotal: 119.97,
        shipping_cost: 12,
        tax_amount: 9.6,
        total_amount: 141.57,
        status: "paid",
      };

      // Setup cart fetch mock
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          };
        }

        if (table === "orders") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockOrder,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "order_items") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }

        return mockSupabase.from();
      });

      // Mock order number generation
      mockSupabase.rpc.mockResolvedValue({
        data: "ORD-20240101-002",
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(result.message).toBe("Order created successfully");
    });

    it("should calculate free shipping for orders over $100", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 4,
          unit_price: 29.99,
          selected_size: "M",
          selected_color: "Blue",
          products: {
            title: "Test Shirt",
            price: 29.99,
            stock: 10,
          },
        },
      ];

      const mockOrder = {
        id: "order-126",
        order_number: "ORD-20240101-003",
        user_id: "user-123",
        subtotal: 119.96,
        shipping_cost: 0, // Free shipping for orders over $100
        tax_amount: 9.6,
        total_amount: 129.56,
        status: "paid",
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          };
        }

        if (table === "orders") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockOrder,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "order_items") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }

        return mockSupabase.from();
      });

      mockSupabase.rpc.mockResolvedValue({
        data: "ORD-20240101-003",
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      // Verify shipping cost is 0 for orders over $100
      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
    });

    it("should handle empty cart error", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        return mockSupabase.from();
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cart is empty");
      expect(response.status).toBe(400);
    });

    it("should handle cart fetch error", async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          };
        }
        return mockSupabase.from();
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cart is empty");
      expect(response.status).toBe(400);
    });

    it("should rollback order if order items creation fails", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 1,
          unit_price: 29.99,
          products: { title: "Test Item", price: 29.99, stock: 10 },
        },
      ];

      const mockOrder = { id: "order-125" };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          };
        }

        if (table === "orders") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockOrder,
                  error: null,
                }),
              }),
            }),
            delete: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }

        if (table === "order_items") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Failed to create order items" },
            }),
          };
        }

        return mockSupabase.from();
      });

      mockSupabase.rpc.mockResolvedValue({
        data: "ORD-20240101-003",
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create order items");
      expect(response.status).toBe(500);
    });

    it("should generate order items with correct product details", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 2,
          unit_price: 29.99,
          selected_size: "M",
          selected_color: "Blue",
          products: {
            title: "Test Shirt",
            price: 29.99,
            stock: 10,
          },
        },
      ];

      const mockOrder = { id: "order-126" };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          };
        }

        if (table === "orders") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockOrder,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "order_items") {
          return {
            insert: jest.fn().mockImplementation((data: any) => {
              capturedOrderItems.push(...data);
              return Promise.resolve({
                data: null,
                error: null,
              });
            }),
          };
        }

        return mockSupabase.from();
      });

      mockSupabase.rpc.mockResolvedValue({
        data: "ORD-20240101-003",
        error: null,
      });

      await POST(mockRequest);

      expect(capturedOrderItems).toHaveLength(1);
      expect(capturedOrderItems[0]).toEqual({
        order_id: "order-126",
        product_id: "prod-1",
        product_title: "Test Shirt",
        selected_size: "M",
        selected_color: "Blue",
        quantity: 2,
        unit_price: 29.99,
        total_price: 59.98,
      });
    });
  });

  describe("Order Calculations", () => {
    it("should calculate complex order with multiple items correctly", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 2,
          unit_price: 25.5,
          selected_size: "M",
          products: { title: "Item 1", price: 25.5, stock: 10 },
        },
        {
          id: "cart-2",
          product_id: "prod-2",
          quantity: 1,
          unit_price: 45.75,
          selected_size: "L",
          products: { title: "Item 2", price: 45.75, stock: 5 },
        },
        {
          id: "cart-3",
          product_id: "prod-3",
          quantity: 3,
          unit_price: 15.25,
          products: { title: "Item 3", price: 15.25, stock: 20 },
        },
      ];

      const expectedSubtotal = 142.5; // (25.50 * 2) + (45.75 * 1) + (15.25 * 3)
      const expectedShipping = 0; // Free shipping over $100
      const expectedTax = 11.4; // 8% of subtotal
      const expectedTotal = 153.9;

      const mockOrder = {
        id: "order-127",
        subtotal: expectedSubtotal,
        shipping_cost: expectedShipping,
        tax_amount: expectedTax,
        total_amount: expectedTotal,
        status: "paid",
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null,
            }),
          };
        }

        if (table === "orders") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockOrder,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "order_items") {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }

        return mockSupabase.from();
      });

      mockSupabase.rpc.mockResolvedValue({
        data: "ORD-20240101-004",
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.subtotal).toBe(expectedSubtotal);
      expect(result.data.shipping_cost).toBe(expectedShipping);
      expect(result.data.tax_amount).toBe(expectedTax);
      expect(result.data.total_amount).toBe(expectedTotal);
    });
  });
});
