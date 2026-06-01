"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import PricingCards from "@/components/pricing/PricingCards";
import CtaBanner from "@/components/home/CtaBanner";

export default function PricingPage() {
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
            Pricing
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
            Simple plans for everyone
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="font-sans text-[18px] leading-relaxed"
            style={{ color: "var(--color-sand)" }}
          >
            Free forever, with paid upgrades to unlock priority access.
          </motion.p>
        </div>
      </section>

      <PricingCards />
      <CtaBanner />
    </>
  );
}
