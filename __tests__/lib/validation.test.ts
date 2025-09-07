import {
  validateEmail,
  validatePrice,
  validateQuantity,
  validateCategory,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePhoneNumber,
  validatePostalCode,
} from "@/lib/utils/validation";

describe("validateEmail", () => {
  test("validates correct emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    expect(validateEmail("user+tag@domain.com")).toBe(true);
  });

  test("rejects invalid emails", () => {
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("test@")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("test@domain")).toBe(false);
  });
});

describe("validatePrice", () => {
  test("validates positive prices", () => {
    expect(validatePrice(29.99)).toBe(true);
    expect(validatePrice(0.01)).toBe(true);
    expect(validatePrice(1000)).toBe(true);
  });

  test("rejects invalid prices", () => {
    expect(validatePrice(0)).toBe(false);
    expect(validatePrice(-10)).toBe(false);
    expect(validatePrice(NaN)).toBe(false);
    expect(validatePrice(Infinity)).toBe(false);
  });
});

describe("validateQuantity", () => {
  test("validates positive integers", () => {
    expect(validateQuantity(1)).toBe(true);
    expect(validateQuantity(5)).toBe(true);
    expect(validateQuantity(100)).toBe(true);
  });

  test("rejects invalid quantities", () => {
    expect(validateQuantity(0)).toBe(false);
    expect(validateQuantity(-1)).toBe(false);
    expect(validateQuantity(1.5)).toBe(false);
    expect(validateQuantity(NaN)).toBe(false);
  });
});

describe("validateCategory", () => {
  test("validates allowed categories", () => {
    expect(validateCategory("men")).toBe(true);
    expect(validateCategory("women")).toBe(true);
    expect(validateCategory("kids")).toBe(true);
    expect(validateCategory("other")).toBe(true);
  });

  test("rejects invalid categories", () => {
    expect(validateCategory("invalid")).toBe(false);
    expect(validateCategory("Men")).toBe(false); // Case sensitive
    expect(validateCategory("")).toBe(false);
    expect(validateCategory("adults")).toBe(false);
  });
});

describe("validateRequired", () => {
  test("validates required fields", () => {
    expect(validateRequired("value")).toBe(true);
    expect(validateRequired("  value  ")).toBe(true); // Trimmed
    expect(validateRequired(123)).toBe(true);
    expect(validateRequired(true)).toBe(true);
  });

  test("rejects empty values", () => {
    expect(validateRequired("")).toBe(false);
    expect(validateRequired("   ")).toBe(false); // Only spaces
    expect(validateRequired(null)).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });
});

describe("validateMinLength", () => {
  test("validates minimum length", () => {
    expect(validateMinLength("hello", 3)).toBe(true);
    expect(validateMinLength("hello", 5)).toBe(true);
    expect(validateMinLength("  hello  ", 5)).toBe(true); // Trimmed
  });

  test("rejects short strings", () => {
    expect(validateMinLength("hi", 3)).toBe(false);
    expect(validateMinLength("", 1)).toBe(false);
    expect(validateMinLength("   ", 1)).toBe(false); // Only spaces
  });
});

describe("validateMaxLength", () => {
  test("validates maximum length", () => {
    expect(validateMaxLength("hello", 10)).toBe(true);
    expect(validateMaxLength("hello", 5)).toBe(true);
    expect(validateMaxLength("  hello  ", 5)).toBe(true); // Trimmed
  });

  test("rejects long strings", () => {
    expect(validateMaxLength("hello world", 5)).toBe(false);
    expect(validateMaxLength("this is a very long string", 10)).toBe(false);
  });
});

describe("validatePhoneNumber", () => {
  test("validates phone numbers", () => {
    expect(validatePhoneNumber("1234567890")).toBe(true);
    expect(validatePhoneNumber("+1 (555) 123-4567")).toBe(true);
    expect(validatePhoneNumber("+44 20 7946 0958")).toBe(true);
    expect(validatePhoneNumber("555-123-4567")).toBe(true);
  });

  test("rejects invalid phone numbers", () => {
    expect(validatePhoneNumber("123")).toBe(false);
    expect(validatePhoneNumber("abc123456")).toBe(false);
    expect(validatePhoneNumber("")).toBe(false);
  });
});

describe("validatePostalCode", () => {
  test("validates US postal codes", () => {
    expect(validatePostalCode("12345", "US")).toBe(true);
    expect(validatePostalCode("12345-6789", "US")).toBe(true);
  });

  test("validates Canadian postal codes", () => {
    expect(validatePostalCode("K1A 0A6", "CA")).toBe(true);
    expect(validatePostalCode("K1A0A6", "CA")).toBe(true);
    expect(validatePostalCode("k1a-0a6", "CA")).toBe(true);
  });

  test("validates UK postal codes", () => {
    expect(validatePostalCode("SW1A 1AA", "UK")).toBe(true);
    expect(validatePostalCode("M1 1AA", "UK")).toBe(true);
    expect(validatePostalCode("B33 8TH", "UK")).toBe(true);
  });

  test("defaults to valid for unknown countries", () => {
    expect(validatePostalCode("12345", "DE")).toBe(true);
    expect(validatePostalCode("ABC123", "FR")).toBe(true);
  });

  test("rejects invalid postal codes", () => {
    expect(validatePostalCode("123", "US")).toBe(false);
    expect(validatePostalCode("12345-67890", "US")).toBe(false);
    expect(validatePostalCode("INVALID", "CA")).toBe(false);
  });
});
