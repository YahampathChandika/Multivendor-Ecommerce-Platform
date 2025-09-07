// Optional: configure or set up a testing framework before each test.
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// Mock Supabase client with proper chaining
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              range: jest.fn(),
            })),
          })),
          range: jest.fn(),
        })),
        range: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
}));

// Mock Supabase server client with proper chaining
jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              range: jest.fn(),
            })),
          })),
          range: jest.fn(),
        })),
        range: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  })),
}));

// Mock auth hook with jest.fn() return
jest.mock("@/lib/hooks/use-auth", () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated: false,
  })),
}));

// Mock API response utilities
jest.mock("@/lib/utils/api-response", () => ({
  createApiResponse: jest.fn((data, status = 200, message) => ({
    json: async () => ({ success: true, data, message }),
    status,
  })),
  createApiError: jest.fn((message, status = 400) => ({
    json: async () => ({ success: false, error: message }),
    status,
  })),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Next.js Image component properly
jest.mock("next/image", () => {
  return function MockImage({ src, alt, fill, unoptimized, ...props }) {
    // Convert boolean props to strings to avoid React warnings
    const imgProps = {
      src,
      alt,
      ...props,
    };

    // Handle boolean attributes that React doesn't like
    if (fill) imgProps["data-fill"] = "true";
    if (unoptimized) imgProps["data-unoptimized"] = "true";

    return React.createElement("img", imgProps);
  };
});

// Mock global React for Next.js Image mock
global.React = require("react");
