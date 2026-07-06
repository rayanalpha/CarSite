"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Package, Info, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="rounded-2xl border border-primary/40 bg-background/70 backdrop-blur-2xl shadow-2xl shadow-black/20">
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-0",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <div className="h-6 w-px bg-border mx-1" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
