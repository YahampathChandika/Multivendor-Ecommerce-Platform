// lib/types/product.ts
export interface Product {
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
  vendors?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type ProductCategory = "all" | "men" | "women" | "kids" | "other";

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "other", label: "Other" },
];
