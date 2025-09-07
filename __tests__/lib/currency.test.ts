import {
  formatCurrency,
  calculateTax,
  calculateShipping,
  calculateDiscount,
  formatPrice,
  parseCurrency,
} from "@/lib/utils/currency";

describe("formatCurrency", () => {
  test("formats USD currency correctly", () => {
    expect(formatCurrency(29.99)).toBe("$29.99");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  test("formats different currencies", () => {
    expect(formatCurrency(29.99, "EUR")).toBe("€29.99");
    expect(formatCurrency(29.99, "GBP")).toBe("£29.99");
  });

  test("handles edge cases", () => {
    expect(formatCurrency(0.01)).toBe("$0.01");
    expect(formatCurrency(999999.99)).toBe("$999,999.99");
  });
});

describe("calculateTax", () => {
  test("calculates tax with default rate", () => {
    expect(calculateTax(100)).toBe(8); // 8% default
    expect(calculateTax(50)).toBe(4);
    expect(calculateTax(0)).toBe(0);
  });

  test("calculates tax with custom rate", () => {
    expect(calculateTax(100, 0.1)).toBe(10); // 10%
    expect(calculateTax(100, 0.05)).toBe(5); // 5%
  });

  test("handles edge cases", () => {
    expect(calculateTax(0.01, 0.08)).toBe(0.0008);
    expect(calculateTax(100, 0)).toBe(0);
  });
});

describe("calculateShipping", () => {
  test("calculates shipping based on weight", () => {
    expect(calculateShipping(0.3)).toBe(12); // <= 0.5kg
    expect(calculateShipping(0.5)).toBe(12);
    expect(calculateShipping(1)).toBe(17); // <= 2kg
    expect(calculateShipping(2)).toBe(17);
    expect(calculateShipping(3)).toBe(22); // > 2kg
  });

  test("calculates shipping with custom base rate", () => {
    expect(calculateShipping(0.3, 15)).toBe(15);
    expect(calculateShipping(1, 15)).toBe(20);
    expect(calculateShipping(3, 15)).toBe(25);
  });

  test("handles edge cases", () => {
    expect(calculateShipping(0)).toBe(12);
    expect(calculateShipping(-1)).toBe(12); // Negative weight
  });
});

describe("calculateDiscount", () => {
  test("calculates percentage discount", () => {
    expect(calculateDiscount(100, "percentage", 10)).toBe(10); // 10%
    expect(calculateDiscount(50, "percentage", 20)).toBe(10); // 20%
    expect(calculateDiscount(100, "percentage", 0)).toBe(0);
  });

  test("calculates fixed discount", () => {
    expect(calculateDiscount(100, "fixed", 15)).toBe(15);
    expect(calculateDiscount(50, "fixed", 15)).toBe(15);
    expect(calculateDiscount(10, "fixed", 15)).toBe(10); // Capped at subtotal
  });

  test("handles edge cases", () => {
    expect(calculateDiscount(0, "percentage", 10)).toBe(0);
    expect(calculateDiscount(0, "fixed", 10)).toBe(0);
    expect(calculateDiscount(100, "fixed", 0)).toBe(0);
  });
});

describe("formatPrice", () => {
  test("formats price to 2 decimal places", () => {
    expect(formatPrice(29.99)).toBe("29.99");
    expect(formatPrice(30)).toBe("30.00");
    expect(formatPrice(29.999)).toBe("30.00");
    expect(formatPrice(29.991)).toBe("29.99");
  });
});

describe("parseCurrency", () => {
  test("parses currency strings", () => {
    expect(parseCurrency("$29.99")).toBe(29.99);
    expect(parseCurrency("€123.45")).toBe(123.45);
    expect(parseCurrency("£1,234.56")).toBe(1234.56);
    expect(parseCurrency("$0.00")).toBe(0);
  });

  test("handles edge cases", () => {
    expect(parseCurrency("29.99")).toBe(29.99); // No symbol
    expect(parseCurrency("$0")).toBe(0);
    expect(parseCurrency("")).toBeNaN();
  });
});
