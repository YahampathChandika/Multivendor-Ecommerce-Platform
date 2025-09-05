// app/products/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SizeSelector } from "@/components/products/size-selector";
import { ColorSwatches } from "@/components/products/color-swatches";
import { useProductStore } from "@/lib/store/product-store";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency } from "@/lib/utils/currency";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  RefreshCw,
  AlertCircle,
  Check,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentProduct, loading, error, fetchProduct } = useProductStore();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug, fetchProduct]);

  useEffect(() => {
    if (currentProduct) {
      // Set default selections
      if (currentProduct.sizes.length > 0 && !selectedSize) {
        setSelectedSize(currentProduct.sizes[0]);
      }
      if (currentProduct.colors.length > 0 && !selectedColor) {
        setSelectedColor(currentProduct.colors[0]);
      }
    }
  }, [currentProduct, selectedSize, selectedColor]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!currentProduct) return;

    setAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity,
          selected_size: selectedSize || null,
          selected_color: selectedColor || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success feedback
        // You can add a toast notification here
        console.log("Added to cart successfully");
      } else {
        throw new Error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      // You can add error notification here
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const canAddToCart =
    currentProduct.stock > 0 &&
    (currentProduct.sizes.length === 0 || selectedSize) &&
    (currentProduct.colors.length === 0 || selectedColor);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span>/</span>
          <Link href="/explore" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="capitalize">{currentProduct.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-white">
              <Image
                src={
                  currentProduct.images[selectedImageIndex] ||
                  "/placeholder-product.jpg"
                }
                alt={currentProduct.title}
                fill
                className="object-cover"
                priority
              />

              {/* Stock Badges */}
              {currentProduct.stock <= 5 && currentProduct.stock > 0 && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  Only {currentProduct.stock} left
                </Badge>
              )}

              {currentProduct.stock === 0 && (
                <Badge variant="secondary" className="absolute top-4 right-4">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            {currentProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-orange-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${currentProduct.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor */}
            {currentProduct.vendors && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentProduct.vendors.name}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {currentProduct.category}
                </Badge>
              </div>
            )}

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentProduct.title}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-orange-500">
                  {formatCurrency(
                    currentProduct.price,
                    currentProduct.currency
                  )}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.5 (128 reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentProduct.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentProduct.description}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Size</h3>
                <SizeSelector
                  sizes={sizes}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                />
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Color</h3>
                <ColorSwatches
                  colors={colors}
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-medium w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuantity(Math.min(currentProduct.stock, quantity + 1))
                  }
                  disabled={quantity >= currentProduct.stock}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {currentProduct.stock} available
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
                size="lg"
              >
                {addingToCart ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {currentProduct.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      On orders over $100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-sm text-muted-foreground">
                      30-day return policy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Quality Guarantee</p>
                    <p className="text-sm text-muted-foreground">
                      Premium materials only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">SKU:</div>
                  <div>{currentProduct.sku}</div>

                  <div className="text-muted-foreground">Category:</div>
                  <div className="capitalize">{currentProduct.category}</div>

                  {currentProduct.weight && (
                    <>
                      <div className="text-muted-foreground">Weight:</div>
                      <div>{currentProduct.weight}kg</div>
                    </>
                  )}

                  <div className="text-muted-foreground">In Stock:</div>
                  <div>{currentProduct.stock} units</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-4 w-24 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
          </div>

          <Skeleton className="h-20 w-full" />

          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded" />
              ))}
            </div>
          </div>

          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
