"use client";

import { useState, useEffect } from "react";

interface SaleTimerProps {
  endDate: string;
  compact?: boolean;
}

export function SaleTimer({ endDate, compact }: SaleTimerProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (time.expired) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[10px] font-mono text-red-400">
        <span className="bg-red-500/15 px-1 py-0.5 rounded">{time.days}d</span>
        <span className="bg-red-500/15 px-1 py-0.5 rounded">{pad(time.hours)}h</span>
        <span className="bg-red-500/15 px-1 py-0.5 rounded">{pad(time.minutes)}m</span>
        <span className="bg-red-500/15 px-1 py-0.5 rounded">{pad(time.seconds)}s</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        {[{ label: "Days", value: time.days }, { label: "Hrs", value: pad(time.hours) }, { label: "Min", value: pad(time.minutes) }, { label: "Sec", value: pad(time.seconds) }].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="bg-red-500/15 text-red-400 font-mono text-lg font-bold min-w-[40px] h-9 flex items-center justify-center rounded-lg">
              {item.value}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
