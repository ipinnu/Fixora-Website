"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { clearDemoSession, type DemoRole } from "@/lib/demo-session";

const LABELS: Record<DemoRole, string> = {
  customer: "client",
  artisan: "artisan",
  admin: "admin",
};

export default function DemoPreviewBanner({ role }: { role: DemoRole }) {
  const label = LABELS[role];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="px-6 lg:px-10 py-3"
      style={{
        backgroundColor: "rgba(200,134,26,0.06)",
        borderBottom: "1px solid rgba(200,134,26,0.14)",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] rounded-md px-2 py-1 mt-0.5"
            style={{
              color: "var(--color-ochre)",
              backgroundColor: "rgba(200,134,26,0.12)",
              border: "1px solid rgba(200,134,26,0.22)",
            }}
          >
            Preview
          </span>
          <p className="font-sans text-[13px] leading-relaxed" style={{ color: "rgba(242,237,223,0.72)" }}>
            You&apos;re exploring the {label} dashboard with sample data. Nothing here is saved to your account.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/signup"
            className="h-8 px-3 rounded-lg font-sans text-[12px] font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #C8861A, #E8A040)",
              color: "#0D0D0B",
            }}
          >
            Create account
          </Link>
          <Link
            href="/login"
            onClick={() => clearDemoSession()}
            className="h-8 px-3 rounded-lg font-sans text-[12px] font-medium transition-colors duration-200"
            style={{
              backgroundColor: "#1B1B17",
              border: "1px solid #2A2A25",
              color: "rgba(242,237,223,0.65)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,223,0.65)";
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
