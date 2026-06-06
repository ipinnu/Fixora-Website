"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function ReviewPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const artisanId = params.get("artisan");
  const jobId = params.get("job");
  const artisanName = params.get("name") ?? "the artisan";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please log in"); setSubmitting(false); return; }

    const { error } = await supabase.from("reviews").insert({
      artisan_id: artisanId,
      reviewer_id: user.id,
      job_id: jobId,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 10%, rgba(200,134,26,0.08) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm">
        <Link href="/" className="block text-center mb-8 font-serif text-[22px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", boxShadow: "0 0 40px rgba(200,134,26,0.3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D0D0B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="font-serif mb-2" style={{ fontSize: "26px", color: "var(--color-cream)" }}>Review submitted</h2>
            <p className="font-sans text-[14px] mb-6" style={{ color: "#5A5A50" }}>Thanks for helping the community!</p>
            <button onClick={() => router.push("/customer")} className="w-full h-11 rounded-xl font-sans text-[14px] font-semibold"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
              Back to dashboard
            </button>
          </motion.div>
        ) : (
          <>
            <h1 className="font-serif text-center mb-2" style={{ fontSize: "26px", color: "var(--color-cream)" }}>Rate {artisanName}</h1>
            <p className="font-sans text-[14px] text-center mb-8" style={{ color: "#5A5A50" }}>How was your experience?</p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-3">
              {[1,2,3,4,5].map(n => (
                <motion.button key={n} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}>
                  <svg width="40" height="40" viewBox="0 0 12 12"
                    fill={n <= (hovered || rating) ? "var(--color-ochre)" : "none"}
                    stroke="var(--color-ochre)" strokeWidth="1"
                    style={{ filter: n <= (hovered || rating) ? "drop-shadow(0 0 6px rgba(200,134,26,0.5))" : "none", transition: "all 0.15s" }}>
                    <polygon points="6,1 7.8,4.2 11.5,4.6 8.8,7.2 9.6,11 6,9.1 2.4,11 3.2,7.2 0.5,4.6 4.2,4.2"/>
                  </svg>
                </motion.button>
              ))}
            </div>
            <p className="font-sans text-[14px] text-center mb-6 h-5 transition-all" style={{ color: "var(--color-ochre)" }}>
              {labels[hovered || rating]}
            </p>

            <div className="mb-5">
              <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Tell others about your experience (optional)…"
                className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none transition-all"
                style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
            </div>

            {error && <p className="font-sans text-[13px] rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>{error}</p>}

            <motion.button whileHover={{ scale: submitting || !rating ? 1 : 1.02 }} whileTap={{ scale: submitting || !rating ? 1 : 0.98 }}
              onClick={handleSubmit} disabled={submitting || !rating}
              className="w-full h-12 rounded-full font-sans text-[15px] font-semibold transition-all"
              style={{ background: rating ? "linear-gradient(135deg, #C8861A, #E8A040)" : "#1B1B17", color: rating ? "#0D0D0B" : "#3A3A33", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting…" : "Submit Review"}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense><ReviewPageContent /></Suspense>;
}
