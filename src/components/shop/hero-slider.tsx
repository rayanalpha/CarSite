"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BrandSlide {
  slug: string;
  name: string;
  logo: string | null;
  heroImage: string | null;
  heroDescription: string | null;
}

interface HeroSliderProps {
  brands: BrandSlide[];
  interval: number;
  autoPlay?: boolean;
  allBrandsHeading?: string;
  allBrandsDescription?: string;
}

function renderHeading(text: string) {
  const pipeIndex = text.indexOf("|");
  if (pipeIndex === -1) return text;
  const before = text.slice(0, pipeIndex).trimEnd();
  const rest = text.slice(pipeIndex + 1);
  const endIndex = rest.indexOf("|") !== -1 ? rest.indexOf("|") : rest.length;
  const highlight = rest.slice(0, endIndex).trim();
  const after = rest.slice(endIndex + (rest.indexOf("|") !== -1 ? 1 : 0)).trimStart();
  return (
    <>
      {before && <>{before} </>}
      <span className="text-gradient">{highlight}</span>
      {after && <><br />{after}</>}
    </>
  );
}

export function HeroSlider({ brands, interval, autoPlay = true, allBrandsHeading, allBrandsDescription }: HeroSliderProps) {
  const defaultHeading = 'Personalize Your |Ride| With the Best Gear';
  const defaultDescription = 'Premium car accessories for every brand. Quality you can trust.';
  const MAX_BRAND_SLIDES = 6;
  const brandSlides = brands.filter((b) => b.heroImage).slice(0, MAX_BRAND_SLIDES);
  const slides = [
    {
      slug: "__all__",
      name: "All Brands",
      logo: null,
      heroImage: null,
      heroDescription: allBrandsDescription || defaultDescription,
    },
    ...brandSlides,
  ];

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || isPaused || !autoPlay) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, interval, isPaused, autoPlay]);

  const slide = slides[current];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding images */}
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className="absolute inset-0"
          style={{ transform: `translateX(${(i - current) * 100}%)` }}
        >
          {s.heroImage ? (
            <img
              src={s.heroImage}
              alt={s.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "eager"}
            />
          ) : (
            <div className="w-full h-full hero-bg" />
          )}
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

      {/* Slide content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-main">
          <div className="max-w-xl">
            {slide.logo && (
              <div className="mb-4">
                <img
                  src={slide.logo}
                  alt={slide.name}
                  className="opacity-90"
                  style={{ width: 56, height: 56 }}
                />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {slide.name === "All Brands" ? (
                renderHeading(allBrandsHeading || defaultHeading)
              ) : (
                slide.name
              )}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg leading-relaxed">
              {slide.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {slide.slug === "__all__" ? (
                <Link href="/products">
                  <button className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              ) : (
                <Link href={`/products?brand=${slide.slug}`}>
                  <button className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                    Explore {slide.name} Products
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
              <Link href="/categories">
                <button className="inline-flex items-center h-11 px-6 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-accent transition-colors">
                  Categories
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center px-4">
          <div className="inline-flex items-center gap-1.5 md:gap-3 overflow-x-auto rounded-full bg-black dark:bg-white px-3 py-1.5 md:px-4 [&::-webkit-scrollbar]:hidden">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => goTo(i)}
                className={`group relative flex items-center gap-2 rounded-full transition-all duration-300 shrink-0 ${
                  i === current
                    ? "bg-white/20 dark:bg-black/20 px-4 py-1.5"
                    : "hover:bg-white/10 dark:hover:bg-black/10 px-3 py-1.5"
                }`}
                aria-label={`Go to ${s.name} slide`}
              >
                {s.logo ? (
                  <div
                    className={`shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                      i === current ? "h-5 w-5 p-0.5" : "h-4 w-4 p-0.5"
                    }`}
                  >
                    <img
                      src={s.logo}
                      alt={s.name}
                      className="w-full h-full object-contain invert dark:invert-0"
                    />
                  </div>
                ) : (
                  <div
                    className={`shrink-0 rounded-full transition-all duration-300 ${
                      i === current
                        ? "h-2.5 w-2.5 bg-white dark:bg-black"
                        : "h-2 w-2 bg-white/50 dark:bg-black/50 group-hover:bg-white/70 dark:group-hover:bg-black/70"
                    }`}
                  />
                )}
                {i === current && (
                  <span className="text-xs font-medium text-white dark:text-black whitespace-nowrap">
                    {s.name === "All Brands" ? "All" : s.name}
                  </span>
                )}
              </button>
            ))}
            <Link
              href="/brands"
              className="group relative flex items-center gap-2 rounded-full transition-all duration-300 shrink-0 hover:bg-white/10 dark:hover:bg-black/10 px-3 py-1.5"
              aria-label="View all brands"
            >
              <div className="shrink-0 flex items-center justify-center rounded-full h-4 w-4 bg-white/60 dark:bg-black/60 group-hover:bg-white/80 dark:group-hover:bg-black/80 transition-all duration-300">
                <svg viewBox="0 0 10 10" className="w-[10px] h-[10px] text-black dark:text-white">
                  <circle cx="2" cy="2" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="2" r="1.2" fill="currentColor" />
                  <circle cx="2" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
