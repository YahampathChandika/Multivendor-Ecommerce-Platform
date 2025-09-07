// components/products/product-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { ensureArray } from "@/lib/utils/array";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Product } from "@/lib/types/product";
import { Plus, Check, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage =
    ensureArray<string>(product.images)[0] || "/placeholder-product.jpg";
  const sizes = ensureArray<string>(product.sizes);
  const colors = ensureArray<string>(product.colors);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (product.stock === 0 || isAdding || justAdded) return;

    setIsAdding(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          selected_size: sizes.length > 0 ? sizes[0] : null, // Default to first size
          selected_color: colors.length > 0 ? colors[0] : null, // Default to first color
        }),
      });

      const result = await response.json();

      if (result.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000); // Reset after 2 seconds
      } else {
        console.error("Failed to add to cart:", result.error);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Link href={`/products/${product.slug}`}>
        <Card className="group overflow-hidden h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white py-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Stock indicator */}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-2 right-2 text-xs"
              >
                Low Stock
              </Badge>
            )}

            {product.stock === 0 && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-xs"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Vendor name */}
              {product.vendors && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {product.vendors.name}
                </p>
              )}

              {/* Product title */}
              <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {product.title}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between md:py-2">
                <p className="font-semibold text-base text-foreground">
                  {formatCurrency(product.price, product.currency)}
                </p>

                {/* Category badge */}
                <Badge variant="outline" className="text-xs capitalize">
                  {product.category}
                </Badge>
              </div>

              {/* Sizes preview */}
              {sizes.length > 0 && (
                <div className="flex items-center gap-1 mt-2 opacity-0 md:opacity-100">
                  <span className="text-xs text-muted-foreground">Sizes:</span>
                  <div className="flex gap-1">
                    {sizes.slice(0, 4).map((size) => (
                      <span
                        key={size}
                        className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                      >
                        {size}
                      </span>
                    ))}
                    {sizes.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{sizes.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Floating Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding || justAdded}
        size="sm"
        className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 size-7 md:size-8 rounded-full p-0 shadow-lg transition-all duration-200 ${
          justAdded
            ? "bg-green-500 hover:bg-green-600"
            : "bg-black/80 hover:bg-neutral-600"
        } ${
          product.stock === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-110"
        }`}
      >
        {isAdding ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : justAdded ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <ShoppingBag className="h-4 w-4 text-white" />
        )}
      </Button>
    </div>
  );
}
