"use client";

import { motion } from "framer-motion";

export default function DemoToggle({
  demo,
  onToggle,
}: {
  demo: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 h-8 rounded-full px-3 font-sans text-[12px] font-semibold transition-all duration-300"
      style={{
        backgroundColor: demo ? "rgba(200,134,26,0.1)" : "rgba(46,204,106,0.08)",
        color: demo ? "var(--color-ochre)" : "#2ECC6A",
        border: `1px solid ${demo ? "rgba(200,134,26,0.25)" : "rgba(46,204,106,0.2)"}`,
      }}
      title={demo ? "Switch to your real data" : "Switch to demo data"}
    >
      {/* Track */}
      <div
        className="relative w-7 h-4 rounded-full transition-colors duration-300 flex-shrink-0"
        style={{ backgroundColor: demo ? "rgba(200,134,26,0.3)" : "rgba(46,204,106,0.25)" }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full"
          animate={{ left: demo ? "2px" : "calc(100% - 14px)" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ backgroundColor: demo ? "var(--color-ochre)" : "#2ECC6A" }}
        />
      </div>
      {demo ? "Demo" : "Live"}
    </motion.button>
  );
}
