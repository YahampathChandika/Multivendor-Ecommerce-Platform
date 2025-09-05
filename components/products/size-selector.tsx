// components/products/size-selector.tsx
"use client";

import { Button } from "@/components/ui/button";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  className?: string;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  className,
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sizes.map((size) => {
        const isSelected = selectedSize === size;

        return (
          <Button
            key={size}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSizeChange(size)}
            className={`min-w-12 h-12 ${
              isSelected
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "hover:border-orange-500 hover:text-orange-500"
            }`}
          >
            {size}
          </Button>
        );
      })}
    </div>
  );
}
