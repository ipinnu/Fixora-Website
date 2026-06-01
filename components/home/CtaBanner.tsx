"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import OchreButton from "@/components/shared/OchreButton";

function AnimatedDiamondGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const CELL = 40;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function drawDiamond(x: number, y: number, half: number) {
      ctx!.beginPath();
      ctx!.moveTo(x, y - half);
      ctx!.lineTo(x + half, y);
      ctx!.lineTo(x, y + half);
      ctx!.lineTo(x - half, y);
      ctx!.closePath();
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / CELL) + 2;
      const rows = Math.ceil(canvas.height / CELL) + 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const half = CELL / 2 - 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const y = r * CELL;

          const dx = (x - cx) / (canvas.width / 2);
          const dy = (y - cy) / (canvas.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);

          const wave = Math.sin(dist * 3.5 - t * 0.8) * 0.5 + 0.5;
          const fade = Math.max(0, 1 - dist * 0.72);
          const alpha = wave * fade * 0.38;

          if (alpha < 0.005) continue;

          ctx.strokeStyle = `rgba(200,134,26,${alpha})`;
          ctx.lineWidth = 0.6;
          drawDiamond(x, y, half);
          ctx.stroke();

          // Fill near wave peak
          if (wave > 0.82 && dist < 1.0) {
            ctx.fillStyle = `rgba(200,134,26,${alpha * 0.25})`;
            drawDiamond(x, y, half);
            ctx.fill();
          }
        }
      }

      t += 0.028;
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}

export default function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden border-y py-24"
      style={{
        backgroundColor: "var(--color-bg-2)",
        borderColor: "var(--color-border)",
      }}
    >
      <AnimatedDiamondGrid />

      {/* Vignette so text stays readable */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(19,19,16,0.88), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-4 font-serif"
          style={{ fontSize: "clamp(32px, 4vw, 56px)", color: "var(--color-cream)" }}
        >
          Ready to get started?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={1}
          className="mb-10 font-sans text-[18px] leading-relaxed"
          style={{ color: "var(--color-sand)" }}
        >
          Join thousands of customers and artisans using FIXORA every day.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={2}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <OchreButton variant="filled" href="/signup">
            Create free account
          </OchreButton>
          <OchreButton variant="ghost" href="/pricing">
            View pricing
          </OchreButton>
        </motion.div>
      </div>
    </section>
  );
}
