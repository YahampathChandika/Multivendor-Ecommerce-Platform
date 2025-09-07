// components/auth/register-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function RegisterForm() {
  const { signIn, loading } = useAuth();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Join FashionHub
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Create your account to start shopping
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border-0 p-10">
        <Button
          onClick={signIn}
          disabled={loading}
          className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md group"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
              <span className="text-base">Creating account...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="text-base font-medium group-hover:text-gray-900 transition-colors">
                Sign up with Google
              </span>
            </div>
          )}
        </Button>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          <div className="text-center text-sm text-gray-500 mb-4">
            What you&apos;ll get:
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span>Save your favorite items</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span>Track your orders</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span>Faster checkout</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span>Exclusive member offers</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium">
              Quick & Secure Signup
            </span>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            By signing up, you agree to our{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer Link */}
      <div className="text-center mt-8">
        <p className="text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-200 hover:underline"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
