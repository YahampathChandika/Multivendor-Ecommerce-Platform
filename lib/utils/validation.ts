// lib/utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

export function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

export function validateCategory(category: string): boolean {
  const validCategories = ["men", "women", "kids", "other"];
  return validCategories.includes(category);
}

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
