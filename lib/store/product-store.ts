// lib/store/product-store.ts
import { create } from "zustand";
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  ProductCategory,
} from "@/lib/types/product";

interface ProductState {
  // State
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (slug: string) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
}

const defaultPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasMore: false,
};

const defaultFilters: ProductFilters = {
  category: "all",
  search: "",
  page: 1,
  limit: 12,
};

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: defaultPagination,

  // Set filters and trigger fetch
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };

    // Reset page if category or search changes
    if (newFilters.category !== undefined || newFilters.search !== undefined) {
      updatedFilters.page = 1;
    }

    set({ filters: updatedFilters });
    get().fetchProducts(updatedFilters);
  },

  // Fetch products with filters
  fetchProducts: async (filters = get().filters) => {
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.page) {
        params.append("page", filters.page.toString());
      }
      if (filters.limit) {
        params.append("limit", filters.limit.toString());
      }

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result: { success: boolean; data: ProductsResponse } =
        await response.json();

      if (!result.success) {
        throw new Error("API returned error");
      }

      const { products, pagination } = result.data;

      set({
        products,
        pagination,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
        products: [],
        pagination: defaultPagination,
      });
    }
  },

  // Fetch single product by slug
  fetchProduct: async (slug: string) => {
    set({ loading: true, error: null, currentProduct: null });

    try {
      const response = await fetch(`/api/products/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product not found");
        }
        throw new Error("Failed to fetch product");
      }

      const result: { success: boolean; data: Product } = await response.json();

      if (!result.success) {
        throw new Error("API returned error");
      }

      set({
        currentProduct: result.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch product",
        currentProduct: null,
      });
    }
  },

  // Fetch featured products for landing page
  fetchFeaturedProducts: async () => {
    try {
      const response = await fetch("/api/products?limit=6");

      if (!response.ok) {
        throw new Error("Failed to fetch featured products");
      }

      const result: { success: boolean; data: ProductsResponse } =
        await response.json();

      if (result.success) {
        set({ featuredProducts: result.data.products });
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      // Don't set error for featured products as it's not critical
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset filters to default
  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchProducts(defaultFilters);
  },
}));
