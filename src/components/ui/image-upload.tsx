"use client";

import { useState, useCallback, useRef } from "react";
import { Image, X, Loader2, Upload, Star } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const images = value
    ? value.split(",").map((u) => u.trim()).filter(Boolean)
    : [];

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: files.length });
    setError("");

    const results: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          results.push(data.url);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Upload failed");
        }
      } catch {
        setError("Network error during upload");
      }

      setProgress((p) => ({ ...p, current: p.current + 1 }));
    }

    if (results.length > 0) {
      const newUrls = [...images, ...results].join(", ");
      onChange(newUrls);
    }

    setUploading(false);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, [images, onChange]);

  function setCover(index: number) {
    if (index === 0) return;
    const updated = [...images];
    const [target] = updated.splice(index, 1);
    updated.unshift(target);
    onChange(updated.join(", "));
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.join(", "));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated.join(", "));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div
            key={i}
            className={`relative group aspect-square w-24 rounded-lg border overflow-hidden bg-secondary ${
              i === 0 ? "ring-2 ring-primary border-primary" : "border-border"
            }`}
          >
            {i === 0 && (
              <div className="absolute top-1 left-1 z-10 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground shadow-sm">
                <Star className="h-2.5 w-2.5 fill-current" />
                Cover
              </div>
            )}
            <img
              src={url}
              alt={`Upload ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                (e.target as HTMLImageElement).classList.add("hidden");
              }}
            />
            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.length > 1 && i > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors text-xs"
                  title="Move left"
                >
                  ←
                </button>
              )}
              {images.length > 1 && i < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors text-xs"
                  title="Move right"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                title="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-gradient-to-t from-black/60 to-transparent text-white py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {i + 1}/{images.length}
            </div>
            {i !== 0 && (
              <button
                type="button"
                onClick={() => setCover(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Set as cover image"
              >
                <div className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm">
                  <Star className="h-3 w-3 text-primary" />
                  Set as Cover
                </div>
              </button>
            )}
          </div>
        ))}

        <label className="flex aspect-square w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-secondary/50 relative">
          {uploading ? (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[10px] text-center leading-tight">
                {progress.current}/{progress.total}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Upload</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {images.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {images.length} image{images.length > 1 ? "s" : ""} &middot; First image is the cover &middot; Hover to reorder, remove, or change cover
        </p>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image className="h-4 w-4" />
          Select multiple images to upload them all at once
        </div>
      )}
    </div>
  );
}
