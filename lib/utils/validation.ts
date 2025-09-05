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

export function validateRequired(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.trim().length <= maxLength;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function validatePostalCode(
  code: string,
  country: string = "US"
): boolean {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  };

  const pattern = patterns[country as keyof typeof patterns];
  return pattern ? pattern.test(code) : true; // Default to valid for unknown countries
}
