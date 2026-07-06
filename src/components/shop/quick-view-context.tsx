"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const QuickViewModal = dynamic(() => import("./quick-view-modal").then((m) => m.QuickViewModal), { ssr: false });

interface QuickViewContextType {
  open: (slug: string) => void;
  close: () => void;
}

const QuickViewContext = createContext<QuickViewContextType>({
  open: () => {},
  close: () => {},
});

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <QuickViewContext.Provider value={{ open: (slug: string) => setActiveSlug(slug), close: () => setActiveSlug(null) }}>
      {children}
      <QuickViewModal slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  return useContext(QuickViewContext);
}
