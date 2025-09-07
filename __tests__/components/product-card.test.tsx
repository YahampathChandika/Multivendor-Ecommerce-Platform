import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types/product";

// Mock Next.js components
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("next/link", () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe("ProductCard", () => {
  const mockProduct: Product = {
    id: "1",
    slug: "test-product",
    sku: "TEST-001",
    title: "Test Product",
    description: "A test product description",
    price: 29.99,
    currency: "USD",
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Blue", "Green"],
    stock: 10,
    weight: 0.5,
    category: "men",
    vendor_id: "vendor-1",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    vendors: {
      id: "vendor-1",
      name: "Test Vendor",
      logo_url: "https://example.com/logo.jpg",
    },
  };

  test("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("Test Vendor")).toBeInTheDocument();
    expect(screen.getByText("men")).toBeInTheDocument();
  });

  test("displays product image with correct alt text", () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText("Test Product");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
  });

  test("shows placeholder image when no images provided", () => {
    const productWithoutImages = {
      ...mockProduct,
      images: [],
    };

    render(<ProductCard product={productWithoutImages} />);

    const image = screen.getByAltText("Test Product");
    expect(image).toHaveAttribute("src", "/placeholder-product.jpg");
  });

  test("displays low stock badge when stock is low", () => {
    const lowStockProduct = {
      ...mockProduct,
      stock: 3,
    };

    render(<ProductCard product={lowStockProduct} />);

    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  test("displays out of stock badge when no stock", () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock: 0,
    };

    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  test("does not show stock badge when stock is sufficient", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.queryByText("Low Stock")).not.toBeInTheDocument();
    expect(screen.queryByText("Out of Stock")).not.toBeInTheDocument();
  });

  test("displays size preview when sizes are available", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Sizes:")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("XL")).toBeInTheDocument();
  });

  test("shows +N more when more than 4 sizes", () => {
    const manySizesProduct = {
      ...mockProduct,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    };

    render(<ProductCard product={manySizesProduct} />);

    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  test("does not show sizes section when no sizes available", () => {
    const noSizesProduct = {
      ...mockProduct,
      sizes: [],
    };

    render(<ProductCard product={noSizesProduct} />);

    expect(screen.queryByText("Sizes:")).not.toBeInTheDocument();
  });

  test("links to correct product page", () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/test-product");
  });

  test("handles missing vendor information", () => {
    const productWithoutVendor = {
      ...mockProduct,
      vendors: undefined,
    };

    render(<ProductCard product={productWithoutVendor} />);

    expect(screen.queryByText("Test Vendor")).not.toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    const { container } = render(
      <ProductCard product={mockProduct} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  test("handles non-array images and sizes gracefully", () => {
    const productWithStringData = {
      ...mockProduct,
      images: '["https://example.com/image.jpg"]' as any,
      sizes: '["S", "M", "L"]' as any,
    };

    render(<ProductCard product={productWithStringData} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByAltText("Test Product")).toBeInTheDocument();
  });
});
