// jest.setup.ts
import "@testing-library/jest-dom";

// Mock Next.js globals that are missing in test environment
global.Request = jest.fn().mockImplementation((url, options = {}) => ({
  url,
  method: options.method || "GET",
  headers: new Map(Object.entries(options.headers || {})),
  json: jest
    .fn()
    .mockResolvedValue(options.body ? JSON.parse(options.body) : {}),
  text: jest.fn().mockResolvedValue(options.body || ""),
  ...options,
}));

global.Response = jest.fn().mockImplementation((body, options = {}) => ({
  status: options.status || 200,
  statusText: options.statusText || "OK",
  headers: new Map(Object.entries(options.headers || {})),
  json: jest
    .fn()
    .mockResolvedValue(typeof body === "string" ? JSON.parse(body) : body),
  text: jest
    .fn()
    .mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
  ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
  ...options,
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock NextRequest and NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, options = {}) => ({
    url,
    method: options.method || "GET",
    headers: new Map(Object.entries(options.headers || {})),
    json: jest.fn().mockResolvedValue({}),
    ...options,
  })),
  NextResponse: {
    json: jest.fn((data, options = {}) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options.status || 200,
      ...options,
    })),
    redirect: jest.fn((url, status = 302) => ({
      status,
      headers: { location: url },
    })),
  },
}));

// Mock Image component to avoid DOM warnings
jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ src, alt, ...props }) => {
    // Remove problematic props that cause React DOM warnings
    const { fill, unoptimized, priority, sizes, ...cleanProps } = props;
    return React.createElement("img", {
      src,
      alt,
      ...cleanProps,
    });
  }),
}));

// Ensure React is available for the Image mock
import React from "react";
