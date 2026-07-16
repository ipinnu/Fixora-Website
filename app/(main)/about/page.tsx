"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import OchreButton from "@/components/shared/OchreButton";
import CtaBanner from "@/components/home/CtaBanner";
import BrandLogo from "@/components/shared/BrandLogo";

const values = [
  {
    title: "Trust by design",
    description:
      "Every feature — escrow, verification, reviews — is built to protect both sides of every transaction.",
  },
  {
    title: "Built for Nigeria",
    description:
      "From Naira pricing to local state filtering, the product is designed around the realities of Nigerian cities.",
  },
  {
    title: "Fair for artisans",
    description:
      "We believe skilled tradespeople deserve fair pay and professional tools to grow their business.",
  },
  {
    title: "Always improving",
    description:
      "AI matching, GPS tracking, video consultation — we ship constantly to make the marketplace smarter.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-16 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(200,134,26,0.07), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 flex justify-center"
          >
            <BrandLogo size={108} href={null} />
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-3 font-sans text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-ochre)" }}
          >
            About
          </motion.p>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-6 font-serif"
            style={{ fontSize: "clamp(40px, 5vw, 72px)", color: "var(--color-cream)" }}
          >
            Africa&apos;s most trusted platform for connecting people to reliable services
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="font-sans text-[18px] leading-relaxed"
            style={{ color: "var(--color-sand)" }}
          >
            FIXORA is a digital marketplace connecting customers with trusted artisans, skilled tradespeople,
            technicians, creatives, and professional service providers across all 36 states of Nigeria and the FCT.
          </motion.p>
        </div>
      </section>

      {/* Mission strip */}
      <section
        className="border-y py-16"
        style={{
          backgroundColor: "var(--color-bg-2)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.blockquote
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="font-serif"
            style={{ fontSize: "clamp(24px, 3vw, 40px)", color: "var(--color-cream)", lineHeight: 1.4 }}
          >
            &ldquo;To simplify access to trusted services through technology, secure transactions, transparency, and nationwide accessibility.&rdquo;
          </motion.blockquote>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={1}
            className="mt-4 font-sans text-[14px]"
            style={{ color: "var(--color-muted)" }}
          >
            — FIXORA Mission Statement
          </motion.p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Photo */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex-shrink-0"
            >
              <div
                className="relative w-64 h-80 sm:w-80 sm:h-[420px] rounded-3xl overflow-hidden"
                style={{ border: "2px solid var(--color-border)" }}
              >
                <Image
                  src="/creator image.jpeg"
                  alt="Odofin Omoloye Rofiat — Founder, FIXORA"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center 12%" }}
                />
              </div>
            </motion.div>

            {/* Bio */}
            <div className="flex-1">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="font-serif mb-1"
                style={{ fontSize: "clamp(28px, 3vw, 44px)", color: "var(--color-cream)" }}
              >
                Odofin Omoloye Rofiat
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={0.5}
                className="font-sans text-[14px] mb-6 tracking-wide uppercase"
                style={{ color: "var(--color-ochre)" }}
              >
                Founder &amp; CEO, Fixora Global Hub Limited
              </motion.p>

              {[
                "Odofin Omoloye Rofiat is an entrepreneur, legal professional, and business innovator with a strong interest in property law, business development, and technology-driven solutions.",
                "With a background in law and a growing interest in international business and technology, Rofiat is passionate about creating practical solutions that address everyday challenges — spanning legal documentation, property transactions, business consulting, and digital platform development.",
                "Driven by a commitment to excellence, innovation, and community impact, her vision is to build sustainable businesses that create value, empower people, and contribute to economic growth both within Nigeria and beyond.",
              ].map((para, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={i + 1}
                  className="font-sans text-[16px] leading-relaxed mb-4 last:mb-0"
                  style={{ color: "var(--color-sand)" }}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="py-20 border-t"
        style={{ backgroundColor: "var(--color-bg-2)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="rounded-2xl border p-8"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3 className="mb-2 font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>
                  {v.title}
                </h3>
                <p className="font-sans text-[15px] leading-relaxed" style={{ color: "var(--color-sand)" }}>
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan CTA */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}
      >
        <div className="mx-auto max-w-xl px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-4 font-serif"
            style={{ fontSize: "clamp(28px, 3vw, 48px)", color: "var(--color-cream)" }}
          >
            Are you an artisan?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={1}
            className="mb-8 font-sans text-[16px]"
            style={{ color: "var(--color-sand)" }}
          >
            Join the marketplace, get verified, and start winning jobs in your area.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={2}
            className="inline-flex"
          >
            <OchreButton variant="filled" href="/signup">
              Become an Artisan
            </OchreButton>
          </motion.div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
