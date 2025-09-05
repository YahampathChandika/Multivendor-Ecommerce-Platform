// lib/utils/api-response.ts
import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function createApiError(
  error: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  console.error("API Error:", error, details);
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}
