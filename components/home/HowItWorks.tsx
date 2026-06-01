"use client";

import { motion } from "framer-motion";
const steps = [
  {
    num: "01",
    title: "Post your job",
    body: "Share details, budget, and photos. Takes less than a minute.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Compare bids",
    body: "Verified artisans submit quotations. You pick the best fit.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Pay securely",
    body: "Funds held in escrow and released only when you're satisfied.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-24"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-3 font-sans text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-ochre-dim)" }}
          >
            How It Works
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-serif"
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "#0D0D0B",
            }}
          >
            Three steps to get the job done
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl p-8 transition-all duration-300"
              style={{
                backgroundColor: "#fff",
                border: "1px solid rgba(13,13,11,0.08)",
                boxShadow: "0 2px 16px rgba(13,13,11,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 32px rgba(200,134,26,0.14)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(200,134,26,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 2px 16px rgba(13,13,11,0.06)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(13,13,11,0.08)";
              }}
            >
              {/* Step number */}
              <span
                className="mb-6 block font-mono text-[13px]"
                style={{ color: "var(--color-ochre)" }}
              >
                {step.num}
              </span>

              {/* Icon */}
              <div
                className="mb-5 inline-flex items-center justify-center rounded-xl p-2.5"
                style={{
                  backgroundColor: "rgba(200,134,26,0.08)",
                  color: "var(--color-ochre)",
                }}
              >
                {step.icon}
              </div>

              {/* Content */}
              <h3
                className="mb-2 font-sans text-[20px] font-semibold"
                style={{ color: "#0D0D0B" }}
              >
                {step.title}
              </h3>
              <p
                className="font-sans text-[15px] leading-relaxed"
                style={{ color: "#5A5A50" }}
              >
                {step.body}
              </p>

              {/* Connector */}
              {i < 2 && (
                <div
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block"
                  style={{ color: "rgba(13,13,11,0.2)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
