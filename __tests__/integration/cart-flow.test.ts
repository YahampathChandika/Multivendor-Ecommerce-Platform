// __tests__/integration/cart-flow.test.ts
/**
 * @jest-environment jsdom
 * Integration test for the complete cart flow
 * Tests the end-to-end journey: Add to cart → View cart → Checkout → Order
 */

import { POST as addToCart } from "@/app/api/cart/route";
import { GET as getCart } from "@/app/api/cart/route";
import { POST as createOrder } from "@/app/api/orders/route";

// Mock authenticated user
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
  },
  rpc: jest.fn(),
};

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock("@/lib/utils/api-response", () => ({
  createApiResponse: jest.fn((data, status = 200, message) => {
    return {
      json: jest.fn().mockResolvedValue({ success: true, data, message }),
      status,
    };
  }),
  createApiError: jest.fn((message, status = 400) => {
    return {
      json: jest.fn().mockResolvedValue({ success: false, error: message }),
      status,
    };
  }),
}));

jest.mock("@/lib/utils/auth-middleware", () => ({
  withAuth: (handler: any) => (request: any) => handler(mockUser, request),
}));

// Mock request helper
const createMockRequest = (body?: any, url?: string) => ({
  json: jest.fn().mockResolvedValue(body || {}),
  url: url || "http://localhost:3000",
});

describe("Cart Integration Flow", () => {
  const mockProduct = {
    id: "product-1",
    title: "Test T-Shirt",
    price: 29.99,
    stock: 10,
    is_active: true,
  };

  const mockCartItem = {
    id: "cart-item-1",
    user_id: "user-123",
    product_id: "product-1",
    quantity: 2,
    selected_size: "M",
    selected_color: "Blue",
    unit_price: 29.99,
    products: mockProduct,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete Purchase Flow", () => {
    it("should handle full purchase flow from add to cart to order creation", async () => {
      // Step 1: Add item to cart
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProduct,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (
          table === "cart_items" &&
          mockSupabaseClient.from.mock.calls.length === 2
        ) {
          // For add to cart operation
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCartItem,
                  error: null,
                }),
              }),
            }),
          };
        }

        if (
          table === "cart_items" &&
          mockSupabaseClient.from.mock.calls.length > 2
        ) {
          // For get cart operation
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [mockCartItem],
                  error: null,
                }),
              }),
            }),
          };
        }

        return mockSupabaseClient;
      });

      // Add to cart
      const addRequest = createMockRequest({
        product_id: "product-1",
        quantity: 2,
        selected_size: "M",
        selected_color: "Blue",
      });

      const addResponse = await addToCart(addRequest as any);
      const addResult = await addResponse.json();

      expect(addResult.success).toBe(true);

      // Step 2: Get cart
      const getRequest = createMockRequest();
      const getResponse = await getCart(getRequest as any);
      const getResult = await getResponse.json();

      expect(getResult.success).toBe(true);
      expect(getResult.data.items).toHaveLength(1);
      expect(getResult.data.summary.subtotal).toBe(59.98); // 29.99 * 2
    });

    it("should handle order creation from populated cart", async () => {
      const mockOrder = {
        id: "order-123",
        order_number: "ORD-20240101-001",
        user_id: "user-123",
        subtotal: 59.98,
        shipping_cost: 12,
        tax_amount: 4.8,
        total_amount: 76.78,
        status: "paid",
      };

      // Mock cart fetch for order creation
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: [mockCartItem],
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

        return mockSupabaseClient;
      });

      mockSupabaseClient.rpc.mockResolvedValue({
        data: "ORD-20240101-001",
        error: null,
      });

      const orderRequest = createMockRequest({
        shipping_address: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        payment_method: "card",
      });

      const orderResponse = await createOrder(orderRequest as any);
      const orderResult = await orderResponse.json();

      expect(orderResult.success).toBe(true);
      expect(orderResult.data.id).toBe("order-123");
      expect(orderResult.data.total_amount).toBe(76.78);
    });

    it("should handle stock validation during add to cart", async () => {
      const lowStockProduct = {
        ...mockProduct,
        stock: 1, // Low stock
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: lowStockProduct,
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabaseClient;
      });

      const addRequest = createMockRequest({
        product_id: "product-1",
        quantity: 5, // More than stock
      });

      const addResponse = await addToCart(addRequest as any);
      const addResult = await addResponse.json();

      expect(addResult.success).toBe(false);
      expect(addResult.error).toBe("Insufficient stock available");
    });

    it("should handle inactive product validation", async () => {
      const inactiveProduct = {
        ...mockProduct,
        is_active: false,
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "products") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: inactiveProduct,
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabaseClient;
      });

      const addRequest = createMockRequest({
        product_id: "product-1",
        quantity: 1,
      });

      const addResponse = await addToCart(addRequest as any);
      const addResult = await addResponse.json();

      expect(addResult.success).toBe(false);
      expect(addResult.error).toBe("Product not found or inactive");
    });

    it("should handle empty cart during order creation", async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: [], // Empty cart
              error: null,
            }),
          };
        }
        return mockSupabaseClient;
      });

      const orderRequest = createMockRequest({
        shipping_address: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        payment_method: "card",
      });

      const orderResponse = await createOrder(orderRequest as any);
      const orderResult = await orderResponse.json();

      expect(orderResult.success).toBe(false);
      expect(orderResult.error).toBe("Cart is empty");
    });

    it("should calculate free shipping for orders over $100", async () => {
      const expensiveCartItem = {
        ...mockCartItem,
        quantity: 4,
        unit_price: 29.99,
      };

      const mockOrder = {
        id: "order-124",
        order_number: "ORD-20240101-002",
        user_id: "user-123",
        subtotal: 119.96, // 29.99 * 4
        shipping_cost: 0, // Free shipping
        tax_amount: 9.6,
        total_amount: 129.56,
        status: "paid",
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === "cart_items") {
          return {
            select: jest.fn().mockResolvedValue({
              data: [expensiveCartItem],
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

        return mockSupabaseClient;
      });

      mockSupabaseClient.rpc.mockResolvedValue({
        data: "ORD-20240101-002",
        error: null,
      });

      const orderRequest = createMockRequest({
        shipping_address: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        payment_method: "card",
      });

      const orderResponse = await createOrder(orderRequest as any);
      const orderResult = await orderResponse.json();

      expect(orderResult.success).toBe(true);
      expect(orderResult.data.shipping_cost).toBe(0);
      expect(orderResult.data.subtotal).toBeGreaterThan(100);
    });
  });
});
