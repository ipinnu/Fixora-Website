"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import OchreButton from "@/components/shared/OchreButton";

const slides = [
  {
    // Nigerian Black man architect on building site — Emmanuel Ikwuegbu
    src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=85",
    alt: "Nigerian architect on site",
    credit: "Builder",
  },
  {
    // Ghanaian artisan woodworking — West Africa
    src: "https://images.unsplash.com/photo-1688240817677-d28b8e232dd4?w=1920&q=85",
    alt: "Ghanaian woodworker",
    credit: "Craftsman",
  },
  {
    // Nigerian construction professional — Emmanuel Ikwuegbu
    src: "https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=1920&q=85",
    alt: "Nigerian construction worker",
    credit: "Engineer",
  },
  {
    // African fisherman — Stephen Tettey Atsu
    src: "https://images.unsplash.com/photo-1760411197109-53647aff0b02?w=1920&q=85",
    alt: "African worker",
    credit: "Artisan",
  },
];

const INTERVAL = 5500;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(Array(slides.length).fill(false));

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(t);
  }, []);

  const markLoaded = (i: number) =>
    setLoaded((prev) => { const n = [...prev]; n[i] = true; return n; });

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden" style={{ backgroundColor: "#000" }}>
      {/* Image slides */}
      {slides.map((slide, i) => (
        <div key={slide.src} className="absolute inset-0">
          <AnimatePresence mode="sync">
            {current === i && (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded[i] ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                  onLoad={() => markLoaded(i)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Layered dark overlays for depth */}
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(13,13,11,0.97) 0%, rgba(13,13,11,0.5) 40%, rgba(13,13,11,0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(13,13,11,0.45) 0%, transparent 60%)",
        }}
      />

      {/* Content — sits at bottom of viewport */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pb-20 pt-48">
          {/* Trade badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-5"
          >
            <span
              className="font-mono text-[11px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-ochre)" }}
            >
              {slides[current].credit}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-serif mb-5 max-w-3xl leading-[1.05]"
            style={{
              fontSize: "clamp(44px, 6vw, 88px)",
              color: "var(--color-cream)",
            }}
          >
            Trusted artisans,{" "}
            <span style={{ color: "var(--color-ochre)" }}>on demand.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mb-8 max-w-md font-sans text-[17px] leading-relaxed"
            style={{ color: "rgba(242,237,223,0.75)" }}
          >
            Post a job, compare bids from verified professionals, and pay
            securely through escrow. Built for Nigeria.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-start gap-3 mb-12"
          >
            <OchreButton variant="filled" href="/post-job">
              Post a Job Free
            </OchreButton>
            <OchreButton variant="ghost" href="/features">
              See Features
            </OchreButton>
          </motion.div>

          {/* Slide indicators + stats row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="transition-all duration-500"
                  style={{
                    width: current === i ? "28px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    backgroundColor:
                      current === i
                        ? "var(--color-ochre)"
                        : "rgba(242,237,223,0.3)",
                  }}
                />
              ))}
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-5 font-sans text-[12px]"
              style={{ color: "rgba(242,237,223,0.5)" }}
            >
              {[
                { value: "36+", label: "States" },
                { value: "24/7", label: "Emergency" },
                { value: "AI", label: "Matching" },
              ].map((s, i) => (
                <span key={s.label} className="flex items-center gap-5">
                  {i > 0 && (
                    <span
                      className="h-3 w-px"
                      style={{ backgroundColor: "rgba(242,237,223,0.2)" }}
                    />
                  )}
                  <span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-ochre)" }}
                    >
                      {s.value}
                    </span>{" "}
                    {s.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
