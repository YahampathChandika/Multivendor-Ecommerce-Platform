// components/explore/explore-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductCard } from "@/components/products/product-card";
import { useProductStore } from "@/lib/store/product-store";
import { PRODUCT_CATEGORIES } from "@/lib/types/product";
import type {  ProductCategory } from "@/lib/types/product";
import { Search, Loader2, AlertCircle } from "lucide-react";

export default function ExploreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the product store for state management
  const {
    products,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    fetchProducts,
    clearError,
  } = useProductStore();

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory =
      (searchParams.get("category") as ProductCategory) || "all";

    setFilters({
      search: urlSearch,
      category: urlCategory,
      page: 1, // Reset to first page when filters change
    });
  }, [searchParams, setFilters]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (category: ProductCategory) => {
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/explore?${params.toString()}`, { scroll: false });

    // Update filters (this will trigger a new fetch)
    setFilters({ category, page: 1 });
  };

  const handleLoadMore = async () => {
    if (!pagination.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      // Load next page
      setFilters({ page: pagination.page + 1 });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const clearAllFilters = () => {
    router.push("/explore", { scroll: false });
    setFilters({
      category: "all",
      search: "",
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.category !== "all" || (filters.search && filters.search.length > 0);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearError();
                  fetchProducts();
                }}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Explore
          </h1>
          <p className="text-gray-600">
            Best trendy collection!
            {filters.search && (
              <span className="ml-2 text-orange-500">
                Search results for &quot;{filters.search}&quot;
              </span>
            )}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                disabled={loading}
                className={`px-4 lg:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 ${
                  filters.category === category.value
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-orange-200 hover:text-orange-500"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {hasActiveFilters && !loading && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {pagination.total} products
              {filters.category !== "all" && ` in ${filters.category}`}
              {filters.search && ` matching "${filters.search}"`}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Loading State - Initial Load */}
        {loading && products.length === 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-in fade-in-0 duration-300"
              />
            ))}
          </div>
        )}

        {/* Loading More State */}
        {(loading && products.length > 0) || isLoadingMore ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* No Results */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500">
                {filters.search
                  ? `No products match "${filters.search}" in ${
                      filters.category === "all"
                        ? "any category"
                        : filters.category
                    }`
                  : `No products available in ${filters.category}`}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Load More Button - Only show if there are more products */}
        {!loading && !isLoadingMore && pagination.hasMore && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="px-8"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More (${pagination.total - products.length} remaining)`
              )}
            </Button>
          </div>
        )}

        {/* All Products Loaded Message */}
        {!loading &&
          !pagination.hasMore &&
          products.length > 0 &&
          pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="text-center text-gray-500">
                <p className="text-sm">
                  You&apos;ve seen all {pagination.total} products!
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="mt-2"
                >
                  Back to top
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
