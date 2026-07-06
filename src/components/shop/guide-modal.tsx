"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { X, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureProtocol } from "@/lib/utils";

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  url?: string | null;
  productName: string;
}

export function GuideModal({ open, onClose, content, url, productName }: GuideModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card rounded-t-2xl">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Installation Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {productName && (
            <p className="text-sm text-muted-foreground">
              Guide for <span className="font-medium text-foreground">{productName}</span>
            </p>
          )}

          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </div>

          {url && (
            <Link href={ensureProtocol(url)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Watch Video Guide
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
