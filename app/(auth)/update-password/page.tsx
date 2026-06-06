"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/login?reset=success");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,134,26,0.09) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm">
        <Link href="/" className="block text-center mb-10 font-serif text-[24px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))", border: "1px solid rgba(200,134,26,0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-center mb-2" style={{ fontSize: "28px", color: "var(--color-cream)" }}>New password</h1>
        <p className="font-sans text-[14px] text-center mb-8" style={{ color: "#5A5A50" }}>Choose a strong password for your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password"
              className="h-12 rounded-xl px-4 pr-11 font-sans text-[15px] outline-none transition-all w-full"
              style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#5A5A50" }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <input type={show ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
            className="h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all w-full"
            style={{ backgroundColor: "#111110", border: `1px solid ${confirm && confirm !== password ? "rgba(232,69,69,0.5)" : "#2A2A25"}`, color: "var(--color-cream)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
            onBlur={e => (e.currentTarget.style.borderColor = confirm && confirm !== password ? "rgba(232,69,69,0.5)" : "#2A2A25")} />

          {/* Strength indicator */}
          <div className="flex gap-1.5">
            {[8, 12, 16].map((len, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: password.length >= len ? (len === 8 ? "#E8A040" : len === 12 ? "#C8861A" : "#2ECC6A") : "#2A2A25" }} />
            ))}
          </div>

          {error && <p className="font-sans text-[13px] rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>{error}</p>}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-2 h-12 w-full rounded-full font-sans text-[15px] font-semibold"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Updating…" : "Set new password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
