// lib/utils/array.ts

/**
 * Safely converts a value to an array, handling JSONB fields from Supabase
 */
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  // Handle string representation of JSON arrays
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // If it's a single value, wrap it in an array
  return [value as T];
}

/**
 * Get the first N items from an array safely
 */
export function getFirstItems<T>(arr: unknown, count: number): T[] {
  const safeArray = ensureArray<T>(arr);
  return safeArray.slice(0, count);
}

/**
 * Check if an array-like value has items
 */
export function hasItems(arr: unknown): boolean {
  const safeArray = ensureArray(arr);
  return safeArray.length > 0;
}
