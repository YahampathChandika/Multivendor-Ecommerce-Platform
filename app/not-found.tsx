// app/not-found.tsx

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* 404 Icon */}
          <div className="w-24 h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-orange-500" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-800">
              Page Not Found
            </h2>
            <p className="text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/explore">
                <Search className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
