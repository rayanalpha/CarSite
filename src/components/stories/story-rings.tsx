"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStories } from "./story-provider";
import { Camera } from "lucide-react";

export function StoryRings() {
  const pathname = usePathname();
  const { stories, openViewer } = useStories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function check() {
      setCanScrollLeft(el!.scrollLeft > 4);
      setCanScrollRight(el!.scrollLeft < el!.scrollWidth - el!.clientWidth - 4);
    }
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [stories]);

  if (pathname !== "/") return null;
  if (stories.length === 0) return null;

  return (
    <div className="relative border-b border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Camera className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Stories</span>
        </div>
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-sm hover:bg-background transition-colors shadow"
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          >
            {stories.map((story, i) => (
                <button
                  key={story.id}
                  onClick={() => openViewer(i)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                  aria-label="View story"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-red-500 to-fuchsia-500">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-card">
                      <img
                        src={story.image}
                        alt="Story"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </button>
            ))}
          </div>
          {canScrollRight && (
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-sm hover:bg-background transition-colors shadow"
              aria-label="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
