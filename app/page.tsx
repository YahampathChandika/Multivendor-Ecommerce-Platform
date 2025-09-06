// app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { AuthButton } from "@/components/auth/auth-button";
import { useProductStore } from "@/lib/store/product-store";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowRight, ShoppingBag, Star, Shield, Truck } from "lucide-react";

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts } = useProductStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Badge */}
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🎉 Best trendy collection!
            </Badge>

            {/* Hero Title */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                Find The
                <br />
                <span className="text-orange-500">Best Collections</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Get your dream item easily with FashionHub and get other
                interesting offers
              </p>
            </div>

            {/* Hero Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Link href="/explore">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <AuthButton />
                  <Button asChild variant="outline" size="lg">
                    <Link href="/explore">
                      Browse Products
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Brands</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-lg text-gray-600">
                We provide the best shopping experience with premium quality
                products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Premium Quality</h3>
                  <p className="text-gray-600">
                    All our products are carefully selected and quality-checked
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Fast Delivery</h3>
                  <p className="text-gray-600">
                    Quick and reliable shipping to your doorstep
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Secure Shopping</h3>
                  <p className="text-gray-600">
                    Your payment and personal information are always protected
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Featured Products
                  </h2>
                  <p className="text-lg text-gray-600">
                    Discover our most popular items
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/explore">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="animate-in fade-in-0 duration-300"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-orange-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Ready to Start Shopping?
              </h2>
              <p className="text-lg text-orange-100">
                Join thousands of happy customers and discover amazing products
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/explore">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Explore Products
                  </Link>
                </Button>
              ) : (
                <>
                  <AuthButton />
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-orange-500 border-white hover:bg-white"
                  >
                    <Link href="/explore">Browse Catalog</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
