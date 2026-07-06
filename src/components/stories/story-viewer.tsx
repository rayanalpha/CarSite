"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useStories } from "./story-provider";
import { X } from "lucide-react";
import { ensureProtocol } from "@/lib/utils";

const STORY_DURATION = 6000;

export function StoryViewer() {
  const { stories, viewerIndex, viewerOpen, closeViewer, markAsSeen } = useStories();
  const [currentIndex, setCurrentIndex] = useState(viewerIndex);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIndexRef = useRef(viewerIndex);

  useEffect(() => {
    setCurrentIndex(viewerIndex);
    setProgress(0);
    setLoaded(false);
    lastIndexRef.current = viewerIndex;
  }, [viewerIndex, viewerOpen]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setProgress(0);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / STORY_DURATION, 1));
    }, 50);
  }, [clearTimer]);

  // Mark the previous story as seen whenever currentIndex advances
  useEffect(() => {
    if (!viewerOpen || currentIndex === lastIndexRef.current) return;
    const prevIdx = lastIndexRef.current;
    const prevStory = stories[prevIdx];
    if (prevStory) markAsSeen(prevStory.id);
    lastIndexRef.current = currentIndex;
  }, [viewerOpen, currentIndex, stories, markAsSeen]);

  function goNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setLoaded(false);
      startTimer();
    } else {
      handleClose();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setLoaded(false);
      startTimer();
    }
  }

  function handleClose() {
    const currentStory = stories[currentIndex];
    if (currentStory) markAsSeen(currentStory.id);
    lastIndexRef.current = viewerIndex;
    closeViewer();
  }

  useEffect(() => {
    if (!viewerOpen) {
      clearTimer();
      return;
    }
    startTimer();
    const timeout = setTimeout(() => {
      goNext();
    }, STORY_DURATION);
    return () => {
      clearTimer();
      clearTimeout(timeout);
    };
  }, [viewerOpen, currentIndex]);

  function handleClick(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goPrev();
    } else {
      goNext();
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }

  useEffect(() => {
    if (!viewerOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewerOpen, currentIndex, stories.length]);

  useEffect(() => {
    if (!viewerOpen || !stories.length) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx < stories.length) {
      const img = new Image();
      img.src = stories[nextIdx].image;
    }
  }, [viewerOpen, currentIndex, stories]);

  if (!viewerOpen || stories.length === 0) return null;

  const story = stories[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-[420px] mx-4 aspect-[9/16] max-h-[90vh]">
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {stories.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress * 100}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div
          className="w-full h-full rounded-lg overflow-hidden cursor-pointer"
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {!loaded && (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 animate-pulse" />
          )}
          <img
            src={story.image}
            alt="Story"
            className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </div>

        {story.link && (
          <div className="absolute bottom-6 left-4 right-4">
            <a
              href={ensureProtocol(story.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 rounded-lg bg-white/20 backdrop-blur-md text-white text-center font-medium hover:bg-white/30 transition-colors"
            >
              {story.linkText || "Learn More"}
            </a>
          </div>
        )}
      </div>

      <div className="hidden md:block absolute inset-y-0 left-0 w-1/4 z-10" onClick={goPrev} />
      <div className="hidden md:block absolute inset-y-0 right-0 w-1/4 z-10" onClick={goNext} />
    </div>
  );
}
