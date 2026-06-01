"use client";

import { useMemo } from "react";

const COLS = 20;
const ROWS = 10;

export default function HeroGrid() {
  const cells = useMemo(() => {
    return Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => {
        const wave = Math.sin(col * 0.6 + row * 0.4) + Math.cos(col * 0.3 - row * 0.5);
        const delay = wave * 4;
        const duration = 7 + Math.abs(Math.sin((col * 3 + row * 5) * 0.2)) * 5;
        return { row, col, delay, duration };
      })
    ).flat();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {cells.map(({ row, col, delay, duration }) => (
          <div
            key={`${row}-${col}`}
            style={{
              border: "0.5px solid rgba(200,134,26,0.06)",
              animationName: "cellPulse",
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
              animationFillMode: "both",
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Fade edges so it doesn't hard-cut */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, var(--color-bg) 90%)",
        }}
      />
    </div>
  );
}
