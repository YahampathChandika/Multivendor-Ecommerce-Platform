// components/products/product-grid.tsx
"use client";

import { useEffect } from "react";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductStore } from "@/lib/store/product-store";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ProductGridProps {
  className?: string;
}

export function ProductGrid({ className }: ProductGridProps) {
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    setFilters,
    clearError,
  } = useProductStore();

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLoadMore = () => {
    setFilters({ page: (filters.page || 1) + 1 });
  };

  const handleRetry = () => {
    clearError();
    fetchProducts();
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Results summary */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {products.length} of {pagination.total} products
            {filters.category !== "all" && <span> in {filters.category}</span>}
            {filters.search && <span> for &quot;{filters.search}&quot;</span>}
          </span>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Loading skeletons */}
        {loading && products.length === 0 && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Products */}
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="animate-in fade-in-0 duration-300"
          />
        ))}

        {/* Loading more skeletons */}
        {loading && products.length > 0 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={`loading-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* No results */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">
              {filters.search || filters.category !== "all"
                ? "Try adjusting your filters or search terms"
                : "We couldn't find any products at the moment"}
            </p>
            {(filters.search || filters.category !== "all") && (
              <Button
                variant="outline"
                onClick={() => useProductStore.getState().resetFilters()}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && pagination.hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${pagination.total - products.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-6 w-8" />
        </div>
      </div>
    </div>
  );
}
