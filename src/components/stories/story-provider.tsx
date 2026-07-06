"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export interface Story {
  id: number;
  image: string;
  link: string | null;
  linkText: string | null;
  expiresAt: string | null;
  sortOrder: number;
  createdAt: string;
}

interface StoryContextValue {
  stories: Story[];
  openViewer: (index: number) => void;
  viewerIndex: number;
  viewerOpen: boolean;
  closeViewer: () => void;
  markAsSeen: (id: number) => void;
}

const StoryContext = createContext<StoryContextValue>({
  stories: [],
  openViewer: () => {},
  viewerIndex: 0,
  viewerOpen: false,
  closeViewer: () => {},
  markAsSeen: () => {},
});

export function useStories() {
  return useContext(StoryContext);
}

export function StoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const countedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStories(data);
      })
      .catch(() => {});
  }, [pathname]);

  const markAsSeen = useCallback((id: number) => {
    if (countedRef.current.has(id)) return;
    countedRef.current.add(id);
    fetch(`/api/stories/${id}/view`, { method: "POST" }).catch(() => {});
  }, []);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  return (
    <StoryContext.Provider value={{ stories, openViewer, viewerIndex, viewerOpen, closeViewer, markAsSeen }}>
      {children}
    </StoryContext.Provider>
  );
}
