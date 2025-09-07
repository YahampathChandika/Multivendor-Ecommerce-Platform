import { ensureArray, getFirstItems, hasItems } from "@/lib/utils/array";

describe("ensureArray", () => {
  test("returns array as-is", () => {
    const input = ["item1", "item2"];
    expect(ensureArray(input)).toEqual(["item1", "item2"]);
    expect(ensureArray(input)).toBe(input); // Same reference
  });

  test("returns empty array for null/undefined", () => {
    expect(ensureArray(null)).toEqual([]);
    expect(ensureArray(undefined)).toEqual([]);
  });

  test("parses JSON string arrays", () => {
    expect(ensureArray('["item1", "item2"]')).toEqual(["item1", "item2"]);
    expect(ensureArray("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(ensureArray("[]")).toEqual([]);
  });

  test("returns single value for invalid JSON", () => {
    expect(ensureArray("invalid json")).toEqual(["invalid json"]);
    expect(ensureArray('{"not": "array"}')).toEqual(['{"not": "array"}']);
    expect(ensureArray("[invalid")).toEqual(["[invalid"]);
  });

  test("wraps single values in array", () => {
    expect(ensureArray("single")).toEqual(["single"]);
    expect(ensureArray(123)).toEqual([123]);
    expect(ensureArray(true)).toEqual([true]);
    expect(ensureArray({ key: "value" })).toEqual([{ key: "value" }]);
  });

  test("handles edge cases", () => {
    expect(ensureArray("")).toEqual([""]);
    expect(ensureArray(0)).toEqual([0]);
    expect(ensureArray(false)).toEqual([false]);
  });
});

describe("getFirstItems", () => {
  test("returns first N items from array", () => {
    const input = ["a", "b", "c", "d", "e"];
    expect(getFirstItems(input, 3)).toEqual(["a", "b", "c"]);
    expect(getFirstItems(input, 1)).toEqual(["a"]);
    expect(getFirstItems(input, 0)).toEqual([]);
  });

  test("handles arrays shorter than count", () => {
    const input = ["a", "b"];
    expect(getFirstItems(input, 5)).toEqual(["a", "b"]);
  });

  test("works with non-array inputs", () => {
    expect(getFirstItems('["a", "b", "c"]', 2)).toEqual(["a", "b"]);
    expect(getFirstItems(null, 3)).toEqual([]);
    expect(getFirstItems("single", 2)).toEqual(["single"]);
  });

  test("handles edge cases", () => {
    expect(getFirstItems([], 3)).toEqual([]);
    expect(getFirstItems(["a"], -1)).toEqual([]);
  });
});

describe("hasItems", () => {
  test("returns true for arrays with items", () => {
    expect(hasItems(["item"])).toBe(true);
    expect(hasItems(["a", "b", "c"])).toBe(true);
    expect(hasItems([0, false, ""])).toBe(true); // Falsy values still count
  });

  test("returns false for empty arrays", () => {
    expect(hasItems([])).toBe(false);
  });

  test("works with non-array inputs", () => {
    expect(hasItems('["item"]')).toBe(true);
    expect(hasItems("[]")).toBe(false);
    expect(hasItems(null)).toBe(false);
    expect(hasItems(undefined)).toBe(false);
    expect(hasItems("single")).toBe(true);
  });

  test("handles JSON parsing", () => {
    expect(hasItems("[1, 2, 3]")).toBe(true);
    expect(hasItems('[""]')).toBe(true); // Empty string in array
    expect(hasItems("invalid json")).toBe(true); // Wrapped as single item
  });
});
