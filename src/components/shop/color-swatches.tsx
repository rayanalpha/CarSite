"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ColorSwatchesProps {
  colors: string;
  size?: "sm" | "md";
}

export function ColorSwatches({ colors, size = "sm" }: ColorSwatchesProps) {
  const colorList = colors.split(",").map((c) => c.trim()).filter(Boolean);
  const [selected, setSelected] = useState<number | null>(null);

  if (colorList.length === 0) return null;

  const circleSize = size === "md" ? "h-6 w-6" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {colorList.map((color, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setSelected(selected === i ? null : i)}
          className={`${circleSize} rounded-full border-2 transition-all duration-200 hover:scale-110 shrink-0 flex items-center justify-center ${
            selected === i ? "border-primary scale-110 ring-1 ring-primary/30" : "border-border"
          }`}
          style={{ backgroundColor: color }}
          title={color}
        >
          {selected === i && (
            <Check
              className={`${size === "md" ? "h-3 w-3" : "h-2 w-2"} text-white drop-shadow-sm`}
              style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.5))" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
