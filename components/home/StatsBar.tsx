"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { raw: 36, display: "36+", label: "States & FCT" },
  { raw: 14, display: "14+", label: "Service Categories" },
  { raw: null, display: "24/7", label: "Emergency Response" },
  { raw: null, display: "Escrow", label: "Protected Payments" },
];

function AnimatedNumber({ target, display }: { target: number | null; display: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === null) return;
    let start = 0;
    const duration = 1200;
    const step = duration / target;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-mono" style={{ fontSize: "36px", color: "var(--color-ochre)" }}>
      {target !== null ? `${count}+` : display}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section
      className="border-y py-10"
      style={{
        backgroundColor: "var(--color-bg-2)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-1 sm:flex-1"
            >
              {i > 0 && (
                <div
                  className="hidden sm:block absolute w-px h-10 self-stretch"
                  style={{ backgroundColor: "var(--color-border)" }}
                />
              )}
              <AnimatedNumber target={s.raw} display={s.display} />
              <span
                className="font-sans text-[14px]"
                style={{ color: "var(--color-muted)" }}
              >
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
