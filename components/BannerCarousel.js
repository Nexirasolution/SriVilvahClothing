'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Palette: 60% white/cream · 25% navy · 10% gold · 5% pale gold
// Keep in sync with Navbar, Footer, ProductCard and CouponMarquee.
const CREAM = '#F8F6EF';
const NAVY_DARK = '#071A3A';
const GOLD = '#C9A227';
const GOLD_PALE = '#E6D39A';

const SLIDE_MS = 4500;

export default function BannerCarousel({ banners }) {
  const count = banners?.length || 0;
  const [index, setIndex] = useState(0);
  // Slides whose <img> has been mounted. Only the current slide and the next
  // one are mounted up front, so banners 3+ are not downloaded until needed.
  const [seen, setSeen] = useState(() => new Set([0]));

  // Mount the current slide and pre-load the next one.
  useEffect(() => {
    if (count < 2) return;
    setSeen((prev) => {
      const next = (index + 1) % count;
      if (prev.has(index) && prev.has(next)) return prev;
      const s = new Set(prev);
      s.add(index);
      s.add(next);
      return s;
    });
  }, [index, count]);

  // Auto-advance. Depends on `index`, so a manual click restarts the timer.
  // Paused while the tab is hidden and skipped entirely for users who prefer
  // reduced motion — no wasted work in the background.
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let t;
    const start = () => {
      clearTimeout(t);
      t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    };
    const onVisibility = () => {
      if (document.hidden) clearTimeout(t);
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [index, count]);

  if (!count) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: CREAM }}>
      {/*
        One image for all screen sizes (recommended upload: 1920 x 810 px).
        The box keeps the same aspect ratio on every device, so on mobile it
        simply scales down and the WHOLE image stays visible.
        - mobile:  object-contain -> never crops, even if the ratio is slightly off
        - desktop: object-cover   -> fills the box edge to edge
      */}
      <div className="relative w-full aspect-[1920/810]">
        {banners.map((b, i) => {
          const isFirst = i === 0;
          return (
            <Link
              key={b._id}
              href={b.link || '#'}
              className={`absolute inset-0 block transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${!b.link ? 'pointer-events-none' : ''}`}
              tabIndex={i === index ? 0 : -1}
              aria-hidden={i !== index}
            >
              {(isFirst || seen.has(i)) && (
                <img
                  src={b.image}
                  alt={b.title || 'Banner'}
                  width={1920}
                  height={810}
                  // First banner is the page's largest paint: load it at once
                  // with high priority. The rest load lazily, only when mounted.
                  loading={isFirst ? 'eager' : 'lazy'}
                  fetchPriority={isFirst ? 'high' : 'auto'}
                  decoding={isFirst ? 'sync' : 'async'}
                  className="absolute inset-0 w-full h-full object-contain object-center sm:object-cover"
                />
              )}
            </Link>
          );
        })}

        {count > 1 && (
          <>
            {/* Arrows — white with navy icon and a thin gold outline so they read on any banner image */}
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10 hover:bg-[#F8F6EF]"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: NAVY_DARK,
                border: `1px solid ${GOLD}`,
                boxShadow: '0 2px 8px rgba(7, 26, 58, 0.15)',
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10 hover:bg-[#F8F6EF]"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: NAVY_DARK,
                border: `1px solid ${GOLD}`,
                boxShadow: '0 2px 8px rgba(7, 26, 58, 0.15)',
              }}
              aria-label="Next"
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>

            {/* Thin dash indicators */}
            <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    height: '3px',
                    width: i === index ? '22px' : '10px',
                    background: i === index ? GOLD : GOLD_PALE,
                    // Navy halo keeps the dashes visible over light or dark banner images
                    boxShadow:
                      i === index
                        ? '0 0 0 1px rgba(7, 26, 58, 0.45)'
                        : '0 0 0 1px rgba(7, 26, 58, 0.25)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}