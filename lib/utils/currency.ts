// lib/utils/currency.ts
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function calculateTax(subtotal: number, taxRate: number = 0.08): number {
  return subtotal * taxRate;
}

export function calculateShipping(
  weight: number,
  baseRate: number = 12.0
): number {
  // Simple shipping calculation based on weight
  if (weight <= 0.5) return baseRate;
  if (weight <= 2) return baseRate + 5;
  return baseRate + 10;
}

export function calculateDiscount(
  subtotal: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): number {
  if (discountType === "percentage") {
    return subtotal * (discountValue / 100);
  }
  return Math.min(discountValue, subtotal);
}

export function formatPrice(price: number): string {
  return price.toFixed(2);
}

export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and parse to number
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ""));
}
