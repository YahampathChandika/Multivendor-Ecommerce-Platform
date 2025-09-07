import { render, screen, fireEvent } from "@testing-library/react";
import { AuthButton } from "@/components/auth/auth-button";
import '@testing-library/jest-dom';

// Mock the useAuth hook
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

jest.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signOut: mockSignOut,
    isAuthenticated: false,
  }),
}));

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe("AuthButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    jest.mocked(require("@/lib/hooks/use-auth").useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
    });

    render(<AuthButton />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("renders authenticated state with user info", () => {
    // Mock authenticated state
    const mockUser = {
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    };

    jest.mocked(require("@/lib/hooks/use-auth").useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<AuthButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByAltText("John Doe")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("calls signOut when sign out button is clicked", () => {
    // Mock authenticated state
    const mockUser = {
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    };

    jest.mocked(require("@/lib/hooks/use-auth").useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<AuthButton />);

    const signOutButton = screen.getByRole("button");
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test("displays fallback user icon when no avatar", () => {
    // Mock authenticated state without avatar
    const mockUser = {
      email: "test@example.com",
      user_metadata: {
        full_name: "John Doe",
      },
    };

    jest.mocked(require("@/lib/hooks/use-auth").useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<AuthButton />);

    // Should show user icon instead of image
    expect(screen.queryByAltText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("displays email as fallback when no name", () => {
    // Mock authenticated state without name
    const mockUser = {
      email: "test@example.com",
      user_metadata: {},
    };

    jest.mocked(require("@/lib/hooks/use-auth").useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<AuthButton />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
