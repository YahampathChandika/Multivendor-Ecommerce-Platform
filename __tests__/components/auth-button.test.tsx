import { render, screen, fireEvent } from "@testing-library/react";
import { AuthButton } from "@/components/auth/auth-button";
import { useAuth } from "@/lib/hooks/use-auth";
import "@testing-library/jest-dom";
import type { User } from "@supabase/supabase-js";

// Mock the useAuth hook
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

// Mock as a jest function that can be modified
jest.mock("@/lib/hooks/use-auth");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Helper function to create a mock Supabase User
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-123",
    aud: "authenticated",
    email: "test@example.com",
    email_confirmed_at: "2023-01-01T00:00:00.000Z",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    app_metadata: {},
    user_metadata: {
      full_name: "John Doe",
      avatar_url: "https://example.com/avatar.jpg",
    },
    role: "authenticated",
    ...overrides,
  };
}

describe("AuthButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock return value
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
      initialized: true,
    });
  });

  test("renders sign in button when not authenticated", () => {
    render(<AuthButton />);

    const signInButton = screen.getByText("Sign In with Google");
    expect(signInButton).toBeInTheDocument();
  });

  test("calls signIn when sign in button is clicked", () => {
    render(<AuthButton />);

    const signInButton = screen.getByText("Sign In with Google");
    fireEvent.click(signInButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  test("renders loading state", () => {
    // Mock loading state
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
      initialized: true,
    });

    render(<AuthButton />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("renders authenticated state with user info", () => {
    // Mock authenticated state
    const mockUser = createMockUser({
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      initialized: true,
    });

    render(<AuthButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByAltText("John Doe")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("calls signOut when sign out button is clicked", () => {
    // Mock authenticated state
    const mockUser = createMockUser({
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      initialized: true,
    });

    render(<AuthButton />);

    const signOutButton = screen.getByRole("button");
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test("displays fallback user icon when no avatar", () => {
    // Mock authenticated state without avatar
    const mockUser = createMockUser({
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
        // No avatar_url
      },
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      initialized: true,
    });

    render(<AuthButton />);

    // Should show user icon instead of image
    expect(screen.queryByAltText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("displays email as fallback when no name", () => {
    // Mock authenticated state without name
    const mockUser = createMockUser({
      email: "test@example.com",
      user_metadata: {
        // No full_name
      },
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      initialized: true,
    });

    render(<AuthButton />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  test("handles user with empty metadata", () => {
    // Mock authenticated state with minimal data
    const mockUser = createMockUser({
      email: "minimal@example.com",
      user_metadata: {},
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      initialized: true,
    });

    render(<AuthButton />);

    // Should fallback to email
    expect(screen.getByText("minimal@example.com")).toBeInTheDocument();
  });
});
