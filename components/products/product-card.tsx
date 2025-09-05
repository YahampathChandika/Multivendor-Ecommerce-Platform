// components/products/product-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images[0] || "/placeholder-product.jpg";

  return (
    <Link href={`/products/${product.slug}`} className={className}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
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
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base text-foreground">
                {formatCurrency(product.price, product.currency)}
              </p>

              {/* Category badge */}
              <Badge variant="outline" className="text-xs capitalize">
                {product.category}
              </Badge>
            </div>

            {/* Sizes preview */}
            {product.sizes.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Sizes:</span>
                <div className="flex gap-1">
                  {product.sizes.slice(0, 4).map((size) => (
                    <span
                      key={size}
                      className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                    >
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{product.sizes.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
