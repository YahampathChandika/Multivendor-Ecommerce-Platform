// components/explore/explore-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Grid,
  Heart,
  ShoppingCart,
  User,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data matching the design
const mockProducts = [
  {
    id: "1",
    title: "Tagerine Shirt",
    price: 240.32,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    category: "women",
  },
  {
    id: "2",
    title: "Leather Coat",
    price: 325.36,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    category: "women",
  },
  {
    id: "3",
    title: "Tagerine Shirt",
    price: 126.47,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
    category: "women",
  },
  {
    id: "4",
    title: "Leather Coat",
    price: 257.85,
    image:
      "https://images.unsplash.com/photo-1506629905057-eb7d95d0d3bf?w=400&h=400&fit=crop",
    category: "men",
  },
  {
    id: "5",
    title: "Premium Shirt",
    price: 189.99,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441b4e54?w=400&h=400&fit=crop",
    category: "men",
  },
  {
    id: "6",
    title: "Casual Coat",
    price: 299.5,
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=400&fit=crop",
    category: "men",
  },
];

const categories = [
  { id: "all", label: "All", active: true },
  { id: "men", label: "Men", active: false },
  { id: "women", label: "Women", active: false },
  { id: "kids", label: "Kids", active: false },
  { id: "other", label: "Other", active: false },
];

export default function ExploreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";

    setSearchQuery(urlSearch);
    setActiveCategory(urlCategory);
  }, [searchParams]);

  // Filter products based on category and search query with loading state
  useEffect(() => {
    setIsLoading(true);

    // Simulate API delay for better UX
    const filterTimeout = setTimeout(() => {
      let filtered = mockProducts;

      // Filter by category
      if (activeCategory !== "all") {
        filtered = filtered.filter(
          (product) => product.category === activeCategory
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((product) =>
          product.title.toLowerCase().includes(query)
        );
      }

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 100); // Small delay to show loading state

    return () => clearTimeout(filterTimeout);
  }, [activeCategory, searchQuery]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    router.push("/explore", { scroll: false });
  };

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
            {searchQuery && (
              <span className="ml-2 text-orange-500">
                Search results for "{searchQuery}"
              </span>
            )}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                disabled={isLoading}
                className={`px-4 lg:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 ${
                  activeCategory === category.id
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
        {(searchQuery || activeCategory !== "all") && !isLoading && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Found {filteredProducts.length} products
              {activeCategory !== "all" && ` in ${activeCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
            {(searchQuery || activeCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group cursor-pointer animate-in fade-in-0 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Add to Cart Button */}
                  <button className="absolute bottom-3 right-3 w-8 h-8 bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-gray-600 text-sm">{product.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No products match "${searchQuery}" in ${
                      activeCategory === "all" ? "any category" : activeCategory
                    }`
                  : `No products available in ${activeCategory}`}
              </p>
            </div>
          </div>
        )}

        {/* Load More - Desktop only */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="hidden lg:flex justify-center mt-12">
            <Button variant="outline" className="px-8">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
