"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideModal } from "./guide-modal";
import { ensureProtocol } from "@/lib/utils";

interface GuideButtonProps {
  url?: string | null;
  content?: string | null;
  productName: string;
  size?: "sm" | "lg";
}

export function GuideButton({ url, content, productName, size = "lg" }: GuideButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!url && !content) return null;

  if (url && !content) {
    return (
      <Link href={ensureProtocol(url)} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size={size} className="w-full gap-2">
          <BookOpen className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
          Installation Guide
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="w-full gap-2"
        onClick={() => setModalOpen(true)}
      >
        <BookOpen className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        Installation Guide
      </Button>
      <GuideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={content || ""}
        url={url}
        productName={productName}
      />
    </>
  );
}
