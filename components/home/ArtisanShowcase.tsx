"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionLabel from "@/components/shared/SectionLabel";
import OchreButton from "@/components/shared/OchreButton";

const artisans = [
  {
    name: "Emeka Okonkwo",
    trade: "Electrician",
    location: "Lagos",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1518882570151-157128e78fa1?w=400&q=80&fit=crop&crop=face",
  },
  {
    name: "Fatima Al-Hassan",
    trade: "Expert Tailor",
    location: "Abuja",
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1505421031134-e57263cae630?w=400&q=80&fit=crop&crop=face",
  },
  {
    name: "Chukwudi Nweke",
    trade: "Plumbing Specialist",
    location: "Port Harcourt",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1614890085618-0e1054da74f8?w=400&q=80&fit=crop&crop=face",
  },
  {
    name: "Aisha Bello",
    trade: "Interior Painter",
    location: "Kano",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1713845784497-fe3d7ed176d8?w=400&q=80&fit=crop&crop=face",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill={s <= Math.round(rating) ? "var(--color-ochre)" : "rgba(200,134,26,0.18)"}
        >
          <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5 4.5 4z" />
        </svg>
      ))}
    </div>
  );
}

export default function ArtisanShowcase() {
  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              className="mb-3 inline-flex"
            >
              <SectionLabel text="Verified Artisans" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.08 }}
              className="font-serif"
              style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
                color: "var(--color-cream)",
              }}
            >
              Meet the professionals
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <OchreButton variant="ghost" href="/browse">
              Browse all →
            </OchreButton>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {artisans.map((a, i) => (
            <Link key={a.name} href="/artisans" aria-label={`Browse artisans like ${a.name}`}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-2xl border cursor-pointer group transition-all duration-300"
              style={{
                backgroundColor: "var(--color-bg-2)",
                borderColor: "var(--color-border)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-ochre)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)")
              }
            >
              {/* Photo */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={a.img}
                  alt={a.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Verified badge */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold"
                  style={{
                    backgroundColor: "var(--color-green-dim)",
                    color: "var(--color-green)",
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 0L6.2 3.8H10L7 6.2 8.1 10 5 7.6 1.9 10 3 6.2 0 3.8H3.8Z" />
                  </svg>
                  Verified
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3
                  className="font-sans text-[16px] font-semibold mb-0.5"
                  style={{ color: "var(--color-cream)" }}
                >
                  {a.name}
                </h3>
                <p
                  className="font-sans text-[13px] mb-3"
                  style={{ color: "var(--color-ochre)" }}
                >
                  {a.trade}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stars rating={a.rating} />
                    <span className="font-sans text-[12px]" style={{ color: "var(--color-muted)" }}>
                      {a.rating}
                    </span>
                  </div>
                  <span className="font-sans text-[12px]" style={{ color: "var(--color-muted)" }}>
                    📍 {a.location}
                  </span>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
