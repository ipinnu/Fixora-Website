"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,134,26,0.09) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm">
        <Link href="/login" className="block text-center mb-10 font-serif text-[24px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))", border: "1px solid rgba(200,134,26,0.2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
              <h1 className="font-serif text-center mb-2" style={{ fontSize: "28px", color: "var(--color-cream)" }}>Reset password</h1>
              <p className="font-sans text-[14px] text-center mb-8" style={{ color: "#5A5A50" }}>
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all w-full"
                  style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
                {error && <p className="font-sans text-[13px] rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>{error}</p>}
                <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="h-12 w-full rounded-full font-sans text-[15px] font-semibold"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Sending…" : "Send reset link"}
                </motion.button>
              </form>
              <p className="font-sans text-[13px] text-center mt-6" style={{ color: "#5A5A50" }}>
                Remember it?{" "}
                <Link href="/login" style={{ color: "var(--color-ochre)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ochre-light)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ochre)")}>Log in</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", boxShadow: "0 0 40px rgba(200,134,26,0.3)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D0D0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="font-serif mb-2" style={{ fontSize: "26px", color: "var(--color-cream)" }}>Check your inbox</h2>
              <p className="font-sans text-[14px] mb-6" style={{ color: "#5A5A50" }}>
                We sent a reset link to <strong style={{ color: "var(--color-cream)" }}>{email}</strong>
              </p>
              <Link href="/login" className="font-sans text-[14px]" style={{ color: "var(--color-ochre)" }}>← Back to login</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
