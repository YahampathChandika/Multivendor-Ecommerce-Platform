// components/products/color-swatches.tsx
"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColorSwatchesProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

// Color mapping for visual swatches
const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  orange: "#f97316",
  tagerine: "#f97316", // Same as orange
  black: "#000000",
  white: "#ffffff",
  gray: "#6b7280",
  grey: "#6b7280",
  brown: "#a3765f",
  navy: "#1e3a8a",
  beige: "#f5f5dc",
  cream: "#fffdd0",
};

function getColorValue(colorName: string): string {
  const normalizedName = colorName.toLowerCase().trim();
  return colorMap[normalizedName] || "#6b7280"; // Default to gray if color not found
}

function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation - use white for dark colors, black for light colors
  if (
    backgroundColor === "#ffffff" ||
    backgroundColor === "#fffdd0" ||
    backgroundColor === "#f5f5dc"
  ) {
    return "#000000";
  }
  return "#ffffff";
}

export function ColorSwatches({
  colors,
  selectedColor,
  onColorChange,
  className,
}: ColorSwatchesProps) {
  if (colors.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Color Swatches */}
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          const colorValue = getColorValue(color);
          const contrastColor = getContrastColor(colorValue);

          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                isSelected
                  ? "border-orange-500 scale-110 shadow-lg"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: colorValue }}
              title={color}
            >
              {isSelected && (
                <Check
                  className="absolute inset-0 m-auto h-5 w-5"
                  style={{ color: contrastColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Color Name */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Selected:</span>
        <Badge variant="outline" className="capitalize">
          {selectedColor}
        </Badge>
      </div>
    </div>
  );
}
