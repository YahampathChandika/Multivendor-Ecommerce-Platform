// app/explore/page.tsx
"use client";

import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/lib/store/product-store";
import { Filter, Grid, List } from "lucide-react";
import { useState } from "react";

export default function ExplorePage() {
  const { pagination, filters } = useProductStore();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
              <p className="text-gray-600 mt-1">Best trendy collection!</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border rounded-lg p-1 bg-white">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Chips - Mobile */}
          <div className="flex flex-wrap gap-2 mt-4 sm:hidden">
            {filters.category !== "all" && (
              <Badge variant="secondary">{filters.category}</Badge>
            )}
            {filters.search && (
              <Badge variant="secondary">&quot;{filters.search}&quot;</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="w-full lg:w-80 space-y-6">
            <Card className="hidden lg:block">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Filters</h2>
                <ProductFilters />
              </CardContent>
            </Card>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="lg:hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <ProductFilters />
                </CardContent>
              </Card>
            )}

            {/* Additional Info Card */}
            <Card className="hidden lg:block">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Need Help?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Free Shipping
                      </p>
                      <p>On orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Easy Returns
                      </p>
                      <p>30-day return policy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Customer Support
                      </p>
                      <p>24/7 help available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <ProductGrid />
          </main>
        </div>
      </div>
    </div>
  );
}
