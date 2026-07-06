"use client";

import { useState } from "react";
import { MessageCircle, Send, Copy, Check, Instagram, Download } from "lucide-react";

interface ShareButtonsProps {
  productName: string;
  productUrl: string;
  productImage?: string;
  price?: number | null;
}

export function ShareButtons({ productName, productUrl, productImage, price }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const text = `${productName}${price ? ` — $${price.toLocaleString("en-US")}` : ""}\n${productUrl}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(productUrl);

  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}`,
      icon: MessageCircle,
      color: "text-green-400",
      bg: "bg-green-400/10 hover:bg-green-400/20",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(productName)}`,
      icon: Send,
      color: "text-sky-400",
      bg: "bg-sky-400/10 hover:bg-sky-400/20",
    },
  ];

  function handleCopyLink() {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInstagramShare() {
    if (navigator.share) {
      navigator.share({ title: productName, text, url: productUrl }).catch(() => {});
    } else {
      handleCopyLink();
    }
  }

  function handleDownloadImage() {
    if (!productImage) return;
    const a = document.createElement("a");
    a.href = productImage;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">Share</p>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border ${s.bg} transition-colors text-xs`}
              title={`Share on ${s.label}`}
            >
              <Icon className={`h-3.5 w-3.5 ${s.color}`} />
              {s.label}
            </a>
          );
        })}

        <button
          onClick={handleInstagramShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-pink-400/10 hover:bg-pink-400/20 transition-colors text-xs"
          title="Share on Instagram"
        >
          <Instagram className="h-3.5 w-3.5 text-pink-400" />
          Instagram
        </button>

        {productImage && (
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors text-xs"
            title="Download image for Instagram Story"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Image
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors text-xs"
          title="Copy product link"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {copied ? "Copied!" : "Link"}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Instagram Story: tap <strong>Instagram</strong> to share via your device, or download the image to post manually.
      </p>
    </div>
  );
}
