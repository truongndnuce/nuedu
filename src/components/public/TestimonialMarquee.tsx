"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiTestimonial } from "@/lib/api/testimonials.api";

interface Props {
  testimonials: ApiTestimonial[];
  locale: string;
}

const GAP = 24;
const TRANSITION_MS = 1500;
const AUTO_INTERVAL_MS = 3500;

export function TestimonialMarquee({ testimonials, locale }: Props) {
  const n = testimonials.length;
  // triple items for seamless infinite loop
  const items = [...testimonials, ...testimonials, ...testimonials];

  const [index, setIndex] = useState(n); // start at middle copy
  const [animated, setAnimated] = useState(true);
  const [cardW, setCardW] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isResetting = useRef(false);

  // Measure container → derive card width
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? 0;
      if (!w) return;
      if (w >= 1024) setCardW((w - GAP * 2) / 3);
      else if (w >= 640) setCardW((w - GAP) / 2);
      else setCardW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // After transition ends, silently reset to equivalent position in middle copy
  useEffect(() => {
    if (isResetting.current) return;
    const outOfBounds = index >= n * 2 || index < n;
    if (!outOfBounds) return;

    isResetting.current = true;
    const id = setTimeout(() => {
      setAnimated(false);
      setIndex((prev) => {
        if (prev >= n * 2) return n + (prev - n * 2);
        return n * 2 - (n - prev);
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimated(true);
          isResetting.current = false;
        })
      );
    }, TRANSITION_MS);

    return () => clearTimeout(id);
  }, [index, n]);

  // Auto advance
  useEffect(() => {
    const id = setInterval(() => {
      if (!isResetting.current) setIndex((i) => i + 1);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => i - 1);
  const next = () => setIndex((i) => i + 1);

  const translateX = cardW ? -(index * (cardW + GAP)) : undefined;

  return (
    <div className="relative px-14">
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{ opacity: cardW ? 1 : 0 }}
      >
        <div
          className="flex pb-1"
          style={{
            gap: `${GAP}px`,
            transform: translateX !== undefined ? `translateX(${translateX}px)` : undefined,
            transition: animated ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)` : "none",
          }}
        >
          {items.map((t, i) => {
            const content = locale === "vi" ? t.contentVi : t.contentEn;
            return (
              <div
                key={`${t.id}-${i}`}
                style={{ width: cardW || 320, flexShrink: 0 }}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <Quote size={28} className="mb-4 shrink-0 text-primary/30" />
                <p className="flex-1 text-sm leading-7 text-muted-foreground">{content}</p>
                <div className="mt-6 flex items-center gap-3">
                  {t.avatar ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    {t.role && (
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={next}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
