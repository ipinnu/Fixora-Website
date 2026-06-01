"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import FeatureGrid from "@/components/features/FeatureGrid";
import CtaBanner from "@/components/home/CtaBanner";

export default function FeaturesPage() {
  return (
    <>
      <section
        className="pt-32 pb-16 text-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-3 font-sans text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-ochre)" }}
          >
            Platform
          </motion.p>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-5 font-serif"
            style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              color: "var(--color-cream)",
            }}
          >
            Built for trust and scale
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="font-sans text-[18px] leading-relaxed"
            style={{ color: "var(--color-sand)" }}
          >
            Modern infrastructure powering Nigeria&apos;s smart services marketplace.
          </motion.p>
        </div>
      </section>

      <FeatureGrid />

      {/* For Customers / For Artisans */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: "var(--color-bg-2)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 text-center font-serif"
            style={{ fontSize: "clamp(28px, 3vw, 48px)", color: "var(--color-cream)" }}
          >
            Built for both sides of the job
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Customers */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="rounded-2xl border p-8"
              style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
            >
              <p className="mb-1 font-sans text-[12px] uppercase tracking-widest" style={{ color: "var(--color-ochre)" }}>For Customers</p>
              <h3 className="mb-6 font-serif text-[26px]" style={{ color: "var(--color-cream)" }}>Find and hire with confidence</h3>
              <ul className="space-y-3">
                {[
                  "Post jobs with photos and videos",
                  "Set your preferred budget",
                  "Receive and compare quotations",
                  "Chat securely with artisans",
                  "Pay through escrow — release only when satisfied",
                  "Rate and review after every job",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-[15px]" style={{ color: "var(--color-sand)" }}>
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--color-ochre)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Artisans */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={1}
              className="rounded-2xl border p-8"
              style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
            >
              <p className="mb-1 font-sans text-[12px] uppercase tracking-widest" style={{ color: "var(--color-ochre)" }}>For Artisans</p>
              <h3 className="mb-6 font-serif text-[26px]" style={{ color: "var(--color-cream)" }}>Grow your trade professionally</h3>
              <ul className="space-y-3">
                {[
                  "Create a professional profile and portfolio",
                  "Receive instant job alerts by location and category",
                  "Submit quotations directly to customers",
                  "Chat and share files with clients",
                  "Build reputation through ratings and reviews",
                  "Get verified and earn priority placement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-[15px]" style={{ color: "var(--color-sand)" }}>
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--color-ochre)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Matching & Emergency Dispatch */}
      <section
        className="py-24 border-t"
        style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <p className="mb-3 font-sans text-[12px] uppercase tracking-widest" style={{ color: "var(--color-ochre)" }}>Smart Matching</p>
              <h2 className="mb-5 font-serif" style={{ fontSize: "clamp(28px, 3vw, 44px)", color: "var(--color-cream)" }}>
                The right artisan, automatically
              </h2>
              <p className="font-sans text-[16px] leading-relaxed" style={{ color: "var(--color-sand)" }}>
                When a customer posts a job, FIXORA automatically notifies relevant artisans based on
                location, category, skills, availability, and verification status. Artisans can instantly
                view job details, budgets, and photos — then submit a quotation in seconds.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={1}
              className="rounded-2xl border p-8"
              style={{ backgroundColor: "var(--color-bg-2)", borderColor: "var(--color-border)" }}
            >
              <p className="mb-1 font-sans text-[12px] uppercase tracking-widest" style={{ color: "var(--color-ochre)" }}>Emergency Dispatch</p>
              <h3 className="mb-4 font-serif text-[22px]" style={{ color: "var(--color-cream)" }}>Urgent jobs, instant response</h3>
              <p className="mb-5 font-sans text-[15px] leading-relaxed" style={{ color: "var(--color-sand)" }}>
                Emergency jobs are prioritised and sent immediately to nearby available artisans — no waiting, no searching.
              </p>
              <ul className="space-y-2">
                {[
                  "Electrical faults",
                  "Plumbing leaks",
                  "Generator failures",
                  "Vehicle breakdowns",
                  "Locksmith services",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-sans text-[14px]" style={{ color: "var(--color-sand)" }}>
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--color-ochre)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
