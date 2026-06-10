"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CategoryGroupSelect from "@/components/CategoryGroupSelect";

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];
export default function ServiceSearch() {
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");

  return (
    <section
      className="py-24"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <Image
              src="/Logo no bcakground.png"
              alt="FIXORA"
              width={72}
              height={72}
              className="mb-5 rounded-xl"
            />
            <span
              className="mb-4 inline-flex items-center rounded-full border px-4 py-1.5 font-sans text-[11px] font-semibold tracking-[0.12em] uppercase"
              style={{
                borderColor: "rgba(13,13,11,0.15)",
                color: "var(--color-ochre-dim)",
              }}
            >
              Find a Service
            </span>
            <h2
              className="font-serif mt-3 mb-5 leading-tight"
              style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "#0D0D0B" }}
            >
              500+ verified artisans,<br />
              every Nigerian state.
            </h2>
            <p
              className="font-sans text-[16px] leading-relaxed max-w-md"
              style={{ color: "#5A5A50" }}
            >
              From Lagos to Kano, find skilled tradespeople near you — plumbers,
              electricians, tailors, caterers, and more.
            </p>
          </motion.div>

          {/* Right — search widget */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-[420px] rounded-3xl p-8"
            style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(13,13,11,0.08)",
              boxShadow: "0 4px 32px rgba(13,13,11,0.08)",
            }}
          >
            <div className="flex flex-col gap-3 mb-4">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-12 w-full rounded-xl border px-4 font-sans text-[15px] outline-none transition-colors duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundColor: "#fafaf8",
                  borderColor: "rgba(13,13,11,0.12)",
                  color: state ? "#0D0D0B" : "#5A5A50",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(13,13,11,0.12)")}
              >
                <option value="" disabled>Select State</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <CategoryGroupSelect
                value={category}
                onChange={setCategory}
                variant="light"
                placeholder="Select Category"
                className="h-12 w-full rounded-xl border font-sans text-[15px] outline-none transition-colors duration-200 cursor-pointer"
                style={{
                  backgroundColor: "#fafaf8",
                  borderColor: "rgba(13,13,11,0.12)",
                  color: category ? "#0D0D0B" : "#5A5A50",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(13,13,11,0.12)")}
              />
            </div>

            <button
              className="w-full h-14 rounded-xl font-sans text-[16px] font-semibold transition-all duration-200"
              style={{
                backgroundColor: "var(--color-ochre)",
                color: "#0D0D0B",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre-light)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre)")}
            >
              Find Artisans →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
