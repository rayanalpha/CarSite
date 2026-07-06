"use client";

import { useEffect, useState } from "react";

interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    setDir(document.documentElement.dir === "rtl" ? "rtl" : "ltr");
  }, []);

  function dismiss() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative h-9 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        <div
          className="marquee-track flex items-center whitespace-nowrap"
          style={{
            animationDirection: dir === "rtl" ? "reverse" : "normal",
          }}
        >
          <span className="mx-4 text-white text-xs font-medium tracking-wide">
            {text}
          </span>
        </div>
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition-colors text-[10px]"
        aria-label="Dismiss announcement"
      >
        ✕
      </button>
      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 25s linear infinite;
        }
        @keyframes marquee-scroll {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
