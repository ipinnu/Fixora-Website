"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const role  = params.get("role")  ?? "customer";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [resent, setResent]   = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (digits.every(d => d !== "")) verify(digits.join(""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const verify = async (token: string) => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }
    router.push(role === "artisan" ? "/artisan" : "/customer");
  };

  const handleInput = (i: number, value: string) => {
    // Handle paste of full code
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const arr = value.split("");
      setDigits(arr);
      inputRefs.current[5]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const resend = async () => {
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#0D0D0B" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,134,26,0.1) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <Link href="/" className="block text-center mb-10 font-serif text-[24px]" style={{ color: "var(--color-ochre)" }}>
          FIXORA
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))", border: "1px solid rgba(200,134,26,0.2)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-center mb-2" style={{ fontSize: "28px", color: "var(--color-cream)" }}>
          Check your email
        </h1>
        <p className="font-sans text-[14px] text-center mb-1" style={{ color: "#5A5A50" }}>
          We sent a 6-digit code to
        </p>
        <p className="font-sans text-[14px] text-center font-semibold mb-8" style={{ color: "var(--color-cream)" }}>
          {email || "your email address"}
        </p>

        {/* OTP inputs */}
        <div className="flex gap-2.5 justify-center mb-5">
          {digits.map((d, i) => (
            <motion.input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.select()}
              whileFocus={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-12 h-14 rounded-xl text-center font-mono text-[22px] font-semibold outline-none transition-all duration-200"
              style={{
                backgroundColor: d ? "rgba(200,134,26,0.08)" : "#111110",
                border: `2px solid ${d ? "rgba(200,134,26,0.5)" : "#2A2A25"}`,
                color: "var(--color-cream)",
                boxShadow: d ? "0 0 12px rgba(200,134,26,0.15)" : "none",
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Loading spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center font-sans text-[13px] rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Resent confirmation */}
        <AnimatePresence>
          {resent && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center font-sans text-[13px] rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: "rgba(46,204,106,0.08)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.15)" }}
            >
              New code sent — check your inbox
            </motion.p>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-6 h-px" style={{ backgroundColor: "#1E1E1A" }} />

        {/* Resend */}
        <p className="font-sans text-[13px] text-center" style={{ color: "#5A5A50" }}>
          Didn't receive it?{" "}
          <button
            onClick={resend}
            disabled={resending}
            className="font-semibold transition-colors duration-150"
            style={{ color: resending ? "#5A5A50" : "var(--color-ochre)" }}
            onMouseEnter={e => { if (!resending) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre-light)"; }}
            onMouseLeave={e => { if (!resending) (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre)"; }}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>

        <p className="font-sans text-[12px] text-center mt-4" style={{ color: "#3A3A33" }}>
          Wrong email?{" "}
          <Link href="/signup" style={{ color: "#5A5A50" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-cream)")}
            onMouseLeave={e => (e.currentTarget.style.color = "#5A5A50")}
          >
            Go back
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
