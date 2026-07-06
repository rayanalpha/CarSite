"use client";

import { Eye } from "lucide-react";
import { useQuickView } from "./quick-view-context";

interface QuickViewButtonProps {
  slug: string;
}

export function QuickViewButton({ slug }: QuickViewButtonProps) {
  const { open } = useQuickView();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(slug);
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground hover:bg-background transition-colors shadow-sm"
    >
      <Eye className="h-3.5 w-3.5" />
      Quick View
    </button>
  );
}
