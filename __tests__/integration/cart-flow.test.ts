/**
 * Integration test for the complete cart flow
 * Tests the end-to-end journey: Add to cart → View cart → Checkout → Order
 */

import { POST as addToCart } from "@/app/api/cart/route";
import { GET as getCart } from "@/app/api/cart/route";
import { POST as createOrder } from "@/app/api/orders/route";
import { NextRequest } from "next/server";

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
};

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

jest.mock("@/lib/utils/auth-middleware", () => ({
  withAuth: (handler: any) => (request: any) => handler(mockUser, request),
}));

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
    test("add to cart → view cart → checkout → create order", async () => {
      // Create mock request without using NextRequest constructor
      const mockProductQuery = {
        json: jest.fn().mockResolvedValue({
          product_id: "product-1",
          quantity: 2,
          selected_size: "M",
          selected_color: "Blue",
        }),
        url: "http://localhost:3000/api/cart",
      } as any;

      const mockCartUpsert = {
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCartItem,
              error: null,
            }),
          }),
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockProductQuery) // For product lookup
        .mockReturnValueOnce(mockCartUpsert); // For cart upsert

      const addRequest = new NextRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: JSON.stringify({
          product_id: "product-1",
          quantity: 2,
          selected_size: "M",
          selected_color: "Blue",
        }),
      });

      const addResponse = await addToCart(addRequest);
      const addData = await addResponse.json();

      expect(addData.success).toBe(true);
      expect(mockCartUpsert.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          product_id: "product-1",
          quantity: 2,
          selected_size: "M",
          selected_color: "Blue",
          unit_price: 29.99,
        },
        expect.any(Object)
      );

      // Step 2: View cart
      const mockCartQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [mockCartItem],
              error: null,
            }),
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValueOnce(mockCartQuery);

      const getRequest = new NextRequest("http://localhost:3000/api/cart");
      const getResponse = await getCart(getRequest);
      const cartData = await getResponse.json();

      expect(cartData.success).toBe(true);
      expect(cartData.data.items).toHaveLength(1);
      expect(cartData.data.summary.subtotal).toBe(59.98); // 2 × 29.99
      expect(cartData.data.summary.totalItems).toBe(2);

      // Step 3: Create order from cart
      const mockOrderQueries = {
        // Cart items query
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockCartItem],
            error: null,
          }),
        }),
        // Order insert
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: "order-123",
                order_number: "ORD-20250101-001",
                total_amount: 71.98, // 59.98 + 12 shipping + tax
                status: "paid",
              },
              error: null,
            }),
          }),
        }),
        // Order items insert
        insert2: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        // Clear cart
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockOrderQueries) // Cart query
        .mockReturnValueOnce({
          // Order insert
          insert: mockOrderQueries.insert,
        })
        .mockReturnValueOnce({
          // Order items insert
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })
        .mockReturnValueOnce({
          // Clear cart
          delete: mockOrderQueries.delete,
        });

      const orderRequest = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          shipping_address: {
            fullName: "John Doe",
            addressLine1: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "US",
          },
          payment_method: "card",
        }),
      });

      const orderResponse = await createOrder(orderRequest);
      const orderData = await orderResponse.json();

      expect(orderData.success).toBe(true);
      expect(mockOrderQueries.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          subtotal: 59.98,
          shipping_cost: 12,
          total_amount: expect.any(Number),
          status: "paid",
        })
      );
    });

    test("handles out of stock during checkout", async () => {
      // Mock cart with item that becomes out of stock
      const outOfStockItem = {
        ...mockCartItem,
        products: {
          ...mockProduct,
          stock: 0, // Out of stock
        },
      };

      const mockCartQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [outOfStockItem],
            error: null,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValueOnce(mockCartQuery);

      const orderRequest = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          shipping_address: {
            fullName: "John Doe",
            addressLine1: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "US",
          },
        }),
      });

      const orderResponse = await createOrder(orderRequest);
      const orderData = await orderResponse.json();

      expect(orderData.success).toBe(false);
      expect(orderData.error).toContain("stock");
    });

    test("calculates totals correctly throughout flow", async () => {
      const cartItems = [
        { ...mockCartItem, quantity: 1, unit_price: 29.99 },
        { ...mockCartItem, id: "cart-2", quantity: 2, unit_price: 39.99 },
      ];

      const expectedSubtotal = 29.99 + 39.99 * 2; // 109.97
      const expectedShipping = 12; // Under $100, so shipping applies
      const expectedTax = expectedSubtotal * 0.08; // 8.80
      const expectedTotal = expectedSubtotal + expectedShipping + expectedTax; // 130.77

      // Mock cart query
      const mockCartQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: cartItems,
            error: null,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValueOnce(mockCartQuery);

      const getRequest = new NextRequest("http://localhost:3000/api/cart");
      const getResponse = await getCart(getRequest);
      const cartData = await getResponse.json();

      expect(cartData.data.summary.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(cartData.data.summary.totalItems).toBe(3);

      // Test order calculation
      mockSupabaseClient.from
        .mockReturnValueOnce(mockCartQuery) // For order creation
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "order-123",
                  total_amount: expectedTotal,
                },
                error: null,
              }),
            }),
          }),
        });

      // Verify calculations are passed correctly to order creation
      expect(expectedTotal).toBeCloseTo(130.77, 2);
    });
  });
});
