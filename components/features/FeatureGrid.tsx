"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Sparkles, Zap, MapPin, Shield, Video, Lock } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    num: "01",
    title: "AI Smart Matching",
    description: "Recommends the best artisans based on ratings, location, response speed, and quality.",
  },
  {
    icon: Zap,
    num: "02",
    title: "Emergency Dispatch",
    description: "Notify nearby professionals instantly for urgent repairs and 24/7 service needs.",
  },
  {
    icon: MapPin,
    num: "03",
    title: "GPS Tracking",
    description: "Track artisan arrival and monitor projects in real time from your dashboard.",
  },
  {
    icon: Shield,
    num: "04",
    title: "Escrow Wallet",
    description: "Payments held safely until you confirm the job is completed to your satisfaction.",
  },
  {
    icon: Video,
    num: "05",
    title: "Video Consultation",
    description: "Hop on a quick video call to discuss project details before hiring.",
  },
  {
    icon: Lock,
    num: "06",
    title: "Fraud Protection",
    description: "Verification systems, AI monitoring, and dispute resolution keep the platform safe.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-16" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300"
                style={{
                  backgroundColor: "var(--color-bg-2)",
                  borderColor: "var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(200,134,26,0.4)";
                  el.style.boxShadow = "0 0 40px rgba(200,134,26,0.08), 0 8px 32px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--color-border)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Radial glow top-left */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(circle, rgba(200,134,26,0.12) 0%, transparent 70%)",
                  }}
                />

                {/* Decorative number */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-4 right-5 font-mono select-none transition-opacity duration-300 group-hover:opacity-30"
                  style={{
                    fontSize: "72px",
                    lineHeight: 1,
                    color: "var(--color-border-light)",
                    opacity: 0.18,
                  }}
                >
                  {f.num}
                </span>

                {/* Top accent line */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px transition-all duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(200,134,26,0) 0%)",
                  }}
                  ref={(el) => {
                    if (!el) return;
                    const parent = el.parentElement;
                    if (!parent) return;
                    parent.addEventListener("mouseenter", () => {
                      el.style.background = "linear-gradient(90deg, transparent, rgba(200,134,26,0.6), transparent)";
                    });
                    parent.addEventListener("mouseleave", () => {
                      el.style.background = "linear-gradient(90deg, transparent, rgba(200,134,26,0) 0%)";
                    });
                  }}
                />

                {/* Icon */}
                <div
                  className="relative mb-6 inline-flex items-center justify-center rounded-2xl p-4"
                  style={{
                    backgroundColor: "var(--color-bg-3)",
                    boxShadow: "inset 0 1px 0 rgba(200,134,26,0.15), 0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  <Icon size={26} style={{ color: "var(--color-ochre)" }} strokeWidth={1.6} />
                </div>

                <h3
                  className="relative mb-3 font-sans text-[19px] font-semibold"
                  style={{ color: "var(--color-cream)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="relative font-sans text-[15px] leading-relaxed"
                  style={{ color: "var(--color-sand)" }}
                >
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
