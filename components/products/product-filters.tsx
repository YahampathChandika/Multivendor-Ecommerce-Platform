// components/products/product-filters.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useProductStore } from "@/lib/store/product-store";
import { PRODUCT_CATEGORIES } from "@/lib/types/product";
import type { ProductCategory } from "@/lib/types/product";

export function ProductFilters() {
  const { filters, setFilters, resetFilters } = useProductStore();
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleCategoryChange = (category: ProductCategory) => {
    setFilters({ category });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters({ search: "" });
  };

  const handleReset = () => {
    setSearchInput("");
    resetFilters();
  };

  const activeFiltersCount = [
    filters.category !== "all",
    filters.search && filters.search.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Categories</h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-auto p-1"
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((category) => {
            const isActive = filters.category === category.value;

            return (
              <Button
                key={category.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.value)}
                className="text-xs h-8"
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.category !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Category:{" "}
                {
                  PRODUCT_CATEGORIES.find((c) => c.value === filters.category)
                    ?.label
                }
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ category: "all" })}
                  className="ml-1 h-auto p-0 w-4"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Search: &quot;{filters.search}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="ml-1 h-auto p-0 w-4"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
