// components/explore/explore-client.tsx
"use client";

import { useState, useEffect } from "react";
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
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredProducts(mockProducts);
    } else {
      setFilteredProducts(
        mockProducts.filter((product) => product.category === activeCategory)
      );
    }
  }, [activeCategory]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
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
          <p className="text-gray-600">Best trendy collection!</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 lg:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Add to Cart Button */}
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg">
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

        {/* Load More - Desktop only */}
        <div className="hidden lg:flex justify-center mt-12">
          <Button variant="outline" className="px-8">
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  );
}
