"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import OchreButton from "@/components/shared/OchreButton";
import CtaBanner from "@/components/home/CtaBanner";
import { ShieldCheck, FileText, Camera, Star } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit identity",
    description: "Upload a valid government-issued ID — NIN, driver's licence, or international passport.",
  },
  {
    icon: Camera,
    title: "Portfolio review",
    description: "Share photos and videos of past work. Our team reviews quality within 48 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Background check",
    description: "Third-party verification confirms your identity, address, and criminal record status.",
  },
  {
    icon: Star,
    title: "Earn the badge",
    description: "Verified artisans get a gold badge, priority placement, and access to premium jobs.",
  },
];

export default function VerificationPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-16 text-center relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle 500px at 50% 40%, rgba(200,134,26,0.06), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-3 font-sans text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-ochre)" }}
          >
            Verification
          </motion.p>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-5 font-serif"
            style={{ fontSize: "clamp(40px, 5vw, 72px)", color: "var(--color-cream)" }}
          >
            Trust starts with verification
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mb-10 font-sans text-[18px] leading-relaxed"
            style={{ color: "var(--color-sand)" }}
          >
            Every artisan on FIXORA goes through a multi-step vetting process so
            customers can hire with confidence.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="inline-flex">
            <OchreButton variant="filled" href="/signup">
              Start verification
            </OchreButton>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={i}
                  className="rounded-2xl border p-8"
                  style={{
                    backgroundColor: "var(--color-bg-2)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div
                    className="mb-5 inline-flex items-center justify-center rounded-xl p-3"
                    style={{ backgroundColor: "var(--color-bg-3)" }}
                  >
                    <Icon size={22} style={{ color: "var(--color-ochre)" }} strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>
                    {step.title}
                  </h3>
                  <p className="font-sans text-[15px] leading-relaxed" style={{ color: "var(--color-sand)" }}>
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
