"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Upload, ImageIcon, Clock, Link2, MoveUp, MoveDown, Eye } from "lucide-react";
import { toast } from "sonner";
import { ensureProtocol } from "@/lib/utils";

interface Story {
  id: number;
  image: string;
  link: string | null;
  linkText: string | null;
  expiresAt: string;
  sortOrder: number;
  views: number;
  createdAt: string;
}

function formatRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${h}h ${m}m remaining`;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPendingPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function cancelPending() {
    setPendingFile(null);
    setPendingPreview(null);
    setLink("");
    setLinkText("");
  }

  async function handleSubmit() {
    if (!pendingFile) { toast.error("Select an image"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", pendingFile);
      if (link) formData.append("link", link);
      if (linkText) formData.append("linkText", linkText);
      formData.append("sortOrder", String(stories.length));

      const res = await fetch("/api/stories", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Story created — auto-expires in 24 hours");
      cancelPending();
      fetchStories();
    } catch {
      toast.error("Failed to create story");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this story permanently?")) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Story deleted");
      fetchStories();
    } catch {
      toast.error("Failed to delete story");
    }
  }

  async function moveStory(id: number, direction: "up" | "down") {
    const idx = stories.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === stories.length - 1) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    const a = stories[idx];
    const b = stories[swap];
    try {
      await Promise.all([
        fetch(`/api/stories/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
        fetch(`/api/stories/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
      ]);
      fetchStories();
    } catch {
      toast.error("Failed to reorder");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stories</h1>
        <p className="text-xs text-muted-foreground hidden md:block">Auto-expires after 24 hours</p>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !pendingFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : pendingFile
            ? "border-primary/50 bg-card"
            : "border-border hover:border-primary/50 hover:bg-card/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {pendingPreview ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 aspect-[9/16] rounded-lg overflow-hidden border border-border shrink-0">
              <img src={pendingPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 w-full space-y-3 text-left">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Link URL (optional)</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background/50">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="https://..."
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Button text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background/50 text-sm outline-none"
                  placeholder="Learn More"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSubmit(); }} disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-2"><span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> Uploading...</span>
                  ) : (
                    "Upload Story"
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); cancelPending(); }} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Drop image here or click to browse</p>
            <p className="text-xs text-muted-foreground">9:16 ratio recommended &bull; Auto-expires in 24h</p>
          </div>
        )}
      </div>

      {/* Story grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No stories yet. Upload one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stories.map((story, index) => (
            <div key={story.id} className="relative group rounded-xl overflow-hidden border border-border bg-card">
              <div className="aspect-[9/16] relative">
                <img
                  src={story.image}
                  alt="Story"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => moveStory(story.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => moveStory(story.id, "down")}
                    disabled={index === stories.length - 1}
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1" />
                  {story.link && (
                    <a href={ensureProtocol(story.link)} target="_blank" rel="noopener noreferrer" className="h-7 w-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRemaining(story.expiresAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{story.views ?? 0} views</span>
                </div>
                {story.link && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    {story.linkText || "Has link"}
                  </div>
                )}
              </div>

              <div className="absolute top-2 left-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/80 text-muted-foreground">
                  #{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
