// app/explore/page.tsx
import { Suspense } from "react";
import ExploreClient from "@/components/explore/explore-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore - FashionHub",
  description: "Discover the best collection of trendy fashion items",
};

function ExplorePageFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Page Title Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Category Filter Skeleton */}
        <div className="mb-8">
          <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded-full w-20 animate-pulse flex-shrink-0"
              ></div>
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
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

        {/* Load More Skeleton */}
        <div className="hidden lg:flex justify-center mt-12">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExplorePageFallback />}>
      <ExploreClient />
    </Suspense>
  );
}
