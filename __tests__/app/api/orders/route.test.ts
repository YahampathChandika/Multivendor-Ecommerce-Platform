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
    // Mock authenticated user
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };
    return handler(mockUser, request);
  },
}));

describe("/api/orders POST", () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
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

      const expectedSubtotal = 119.97; // (29.99 * 2) + (59.99 * 1)
      const expectedShipping = 12; // Less than $100, so shipping applies
      const expectedTax = expectedSubtotal * 0.08; // 8% tax
      const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;

      // Mock cart fetch
      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      // Mock order number generation
      mockSupabase.rpc.mockResolvedValueOnce({
        data: "ORD-20240101-001",
        error: null,
      });

      // Mock order creation
      const mockOrder = {
        id: "order-123",
        order_number: "ORD-20240101-001",
        user_id: "user-123",
        subtotal: expectedSubtotal,
        shipping_cost: expectedShipping,
        tax_amount: expectedTax,
        total_amount: expectedTotal,
        status: "paid",
        payment_method: "card",
        payment_status: "completed",
      };

      mockSupabase.insert.mockImplementation((data: any) => {
        if (Array.isArray(data)) {
          // Order items insertion
          return {
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          };
        } else {
          // Order insertion
          return {
            select: () => ({
              single: () => Promise.resolve({ data: mockOrder, error: null }),
            }),
          };
        }
      });

      // Mock cart clearing
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(result.message).toBe("Order created successfully");

      // Verify cart items were fetched
      expect(mockSupabase.from).toHaveBeenCalledWith("cart_items");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-123");

      // Verify order was created with correct calculations
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: expectedSubtotal,
          shipping_cost: expectedShipping,
          tax_amount: expectedTax,
          total_amount: expectedTotal,
          status: "paid",
          payment_method: "card",
          payment_status: "completed",
        })
      );

      // Verify cart was cleared
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it("should calculate free shipping for orders over $100", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 2,
          unit_price: 60.0,
          products: {
            title: "Expensive Item",
            price: 60.0,
            stock: 10,
          },
        },
      ];

      const expectedSubtotal = 120.0; // 60 * 2
      const expectedShipping = 0; // Free shipping over $100
      const expectedTax = expectedSubtotal * 0.08;
      const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: "ORD-20240101-002",
        error: null,
      });

      const mockOrder = {
        id: "order-124",
        order_number: "ORD-20240101-002",
        subtotal: expectedSubtotal,
        shipping_cost: expectedShipping,
        tax_amount: expectedTax,
        total_amount: expectedTotal,
      };

      mockSupabase.insert.mockImplementation((data: any) => {
        if (Array.isArray(data)) {
          return {
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          };
        } else {
          return {
            select: () => ({
              single: () => Promise.resolve({ data: mockOrder, error: null }),
            }),
          };
        }
      });

      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          shipping_cost: 0, // Should be free
          subtotal: 120.0,
        })
      );
    });

    it("should handle empty cart error", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cart is empty");
      expect(response.status).toBe(400);
    });

    it("should handle cart fetch error", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" },
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

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: "ORD-20240101-003",
        error: null,
      });

      const mockOrder = { id: "order-125" };

      mockSupabase.insert.mockImplementation((data: any) => {
        if (Array.isArray(data)) {
          // Order items insertion fails
          return Promise.resolve({
            data: null,
            error: { message: "Failed to create order items" },
          });
        } else {
          // Order insertion succeeds
          return {
            select: () => ({
              single: () => Promise.resolve({ data: mockOrder, error: null }),
            }),
          };
        }
      });

      // Mock order deletion for rollback
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create order items");
      expect(response.status).toBe(500);

      // Verify rollback happened
      expect(mockSupabase.delete).toHaveBeenCalledWith();
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "order-125");
    });

    it("should validate required shipping address fields", async () => {
      const invalidRequestBody = {
        shipping_address: {
          fullName: "", // Missing required field
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
        },
        payment_method: "card",
      };

      mockRequest = {
        json: jest.fn().mockResolvedValue(invalidRequestBody),
        url: "http://localhost:3000/api/orders",
      } as any;

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid shipping address");
      expect(response.status).toBe(400);
    });

    it("should generate order items with correct product details", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 2,
          unit_price: 25.5,
          selected_size: "L",
          selected_color: "Green",
          products: {
            title: "Green T-Shirt",
            price: 25.5,
            stock: 15,
          },
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: "ORD-20240101-004",
        error: null,
      });

      const mockOrder = { id: "order-126" };

      let capturedOrderItems: any[] = [];
      mockSupabase.insert.mockImplementation((data: any) => {
        if (Array.isArray(data)) {
          capturedOrderItems = data;
          return Promise.resolve({ data: null, error: null });
        } else {
          return {
            select: () => ({
              single: () => Promise.resolve({ data: mockOrder, error: null }),
            }),
          };
        }
      });

      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await POST(mockRequest);

      expect(capturedOrderItems).toHaveLength(1);
      expect(capturedOrderItems[0]).toEqual({
        order_id: "order-126",
        product_id: "prod-1",
        product_title: "Green T-Shirt",
        selected_size: "L",
        selected_color: "Green",
        quantity: 2,
        unit_price: 25.5,
        total_price: 51.0, // 25.50 * 2
      });
    });
  });

  describe("Input Validation", () => {
    it("should require shipping address", async () => {
      const invalidRequest = {
        json: jest.fn().mockResolvedValue({
          payment_method: "card",
        }),
        url: "http://localhost:3000/api/orders",
      } as any;

      const response = await POST(invalidRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid shipping address");
      expect(response.status).toBe(400);
    });

    it("should require fullName in shipping address", async () => {
      const invalidRequest = {
        json: jest.fn().mockResolvedValue({
          shipping_address: {
            addressLine1: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
          },
          payment_method: "card",
        }),
        url: "http://localhost:3000/api/orders",
      } as any;

      const response = await POST(invalidRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid shipping address");
    });

    it("should require addressLine1 in shipping address", async () => {
      const invalidRequest = {
        json: jest.fn().mockResolvedValue({
          shipping_address: {
            fullName: "John Doe",
            city: "New York",
            state: "NY",
            postalCode: "10001",
          },
          payment_method: "card",
        }),
        url: "http://localhost:3000/api/orders",
      } as any;

      const response = await POST(invalidRequest);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid shipping address");
    });
  });

  describe("Order Calculations", () => {
    it("should calculate complex order with multiple items correctly", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          product_id: "prod-1",
          quantity: 3,
          unit_price: 15.99,
          products: { title: "Item 1", price: 15.99, stock: 20 },
        },
        {
          id: "cart-2",
          product_id: "prod-2",
          quantity: 1,
          unit_price: 45.5,
          products: { title: "Item 2", price: 45.5, stock: 5 },
        },
        {
          id: "cart-3",
          product_id: "prod-3",
          quantity: 2,
          unit_price: 22.25,
          products: { title: "Item 3", price: 22.25, stock: 8 },
        },
      ];

      // Expected calculations:
      // Subtotal: (15.99 * 3) + (45.50 * 1) + (22.25 * 2) = 47.97 + 45.50 + 44.50 = 137.97
      // Shipping: Free (over $100)
      // Tax: 137.97 * 0.08 = 11.0376
      // Total: 137.97 + 0 + 11.0376 = 149.0076

      const expectedSubtotal = 137.97;
      const expectedShipping = 0;
      const expectedTax = 11.0376;
      const expectedTotal = 149.0076;

      mockSupabase.select.mockResolvedValueOnce({
        data: mockCartItems,
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: "ORD-20240101-005",
        error: null,
      });

      const mockOrder = {
        id: "order-127",
        subtotal: expectedSubtotal,
        shipping_cost: expectedShipping,
        tax_amount: expectedTax,
        total_amount: expectedTotal,
      };

      mockSupabase.insert.mockImplementation((data: any) => {
        if (Array.isArray(data)) {
          return Promise.resolve({ data: null, error: null });
        } else {
          return {
            select: () => ({
              single: () => Promise.resolve({ data: mockOrder, error: null }),
            }),
          };
        }
      });

      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: expectedSubtotal,
          shipping_cost: expectedShipping,
          tax_amount: expectedTax,
          total_amount: expectedTotal,
        })
      );
    });
  });
});
