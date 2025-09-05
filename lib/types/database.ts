// lib/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMetadata {
  method?: string;
  transactionId?: string;
  processor?: string;
  last4?: string;
  [key: string]: Json | undefined;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          email: string;
          description: string | null;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          description?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          description?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          sku: string;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          images: string[];
          sizes: string[];
          colors: string[];
          stock: number;
          weight: number | null;
          category: "men" | "women" | "kids" | "other";
          vendor_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          sku: string;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          images?: string[];
          sizes?: string[];
          colors?: string[];
          stock?: number;
          weight?: number | null;
          category: "men" | "women" | "kids" | "other";
          vendor_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          sku?: string;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          images?: string[];
          sizes?: string[];
          colors?: string[];
          stock?: number;
          weight?: number | null;
          category?: "men" | "women" | "kids" | "other";
          vendor_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          selected_size: string | null;
          selected_color: string | null;
          unit_price: number;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          selected_size?: string | null;
          selected_color?: string | null;
          unit_price: number;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          selected_size?: string | null;
          selected_color?: string | null;
          unit_price?: number;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          shipping_address: ShippingAddress;
          tracking_number: string | null;
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          status:
            | "pending"
            | "paid"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_method: string | null;
          payment_status: "pending" | "completed" | "failed";
          payment_metadata: PaymentMetadata;
          notes: string | null;
          created_at: string;
          updated_at: string;
          shipped_at: string | null;
          delivered_at: string | null;
          estimated_delivery: string | null;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          shipping_address: ShippingAddress;
          tracking_number?: string | null;
          subtotal: number;
          shipping_cost?: number;
          tax_amount?: number;
          total_amount: number;
          currency?: string;
          status?:
            | "pending"
            | "paid"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_method?: string | null;
          payment_status?: "pending" | "completed" | "failed";
          payment_metadata?: PaymentMetadata;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          shipped_at?: string | null;
          delivered_at?: string | null;
          estimated_delivery?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          shipping_address?: ShippingAddress;
          tracking_number?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          status?:
            | "pending"
            | "paid"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_method?: string | null;
          payment_status?: "pending" | "completed" | "failed";
          payment_metadata?: PaymentMetadata;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          shipped_at?: string | null;
          delivered_at?: string | null;
          estimated_delivery?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_title: string;
          selected_size: string | null;
          selected_color: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_title: string;
          selected_size?: string | null;
          selected_color?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_title?: string;
          selected_size?: string | null;
          selected_color?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
    };
  };
};
