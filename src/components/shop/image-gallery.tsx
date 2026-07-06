"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight")
        setSelectedIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft")
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [lightboxOpen, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-secondary overflow-hidden border border-border flex items-center justify-center">
        <div className="text-muted-foreground">No image</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="aspect-square rounded-xl bg-secondary overflow-hidden border border-border group cursor-pointer relative"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
            priority={selectedIndex === 0}
            unoptimized={images[selectedIndex].startsWith("/uploads/") || images[selectedIndex].startsWith("/api/uploads/")}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`relative shrink-0 w-20 h-20 rounded-lg border overflow-hidden bg-secondary transition-all ${
                  i === selectedIndex
                    ? "ring-2 ring-primary border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={85}
                  unoptimized={img.startsWith("/uploads/") || img.startsWith("/api/uploads/")}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(
                    (prev) => (prev - 1 + images.length) % images.length
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 text-xs text-white/60">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
