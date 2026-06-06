"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { submitBid } from "@/lib/supabase/bids";

interface Job {
  id: string; title: string; category: string; state: string; lga: string | null;
  description: string | null; timeline: string | null; budget_amount: number | null;
  status: string; created_at: string;
  customer: { full_name: string | null } | null;
  photos: { url: string }[];
  bid_count: number;
}

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("jobs")
        .select("*, customer:profiles!customer_id(full_name), photos:job_photos(url), bid_count:bids(count)")
        .eq("id", id)
        .single(),
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return null;
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        return data?.role ?? null;
      }),
    ]).then(([{ data, error }, role]) => {
      if (error || !data) { setLoading(false); return; }
      setJob({
        ...data,
        bid_count: (data.bid_count as unknown as Array<{ count: number }>)?.[0]?.count ?? 0,
      });
      setUserRole(role);
      setLoading(false);
    });
  }, [id]);

  const handleBid = async () => {
    if (!bidAmount) return;
    setBidding(true); setBidError("");
    const { error } = await submitBid(id, Number(bidAmount), bidMessage);
    setBidding(false);
    if (error) { setBidError(error); return; }
    setBidDone(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#0D0D0B" }}>
      <p className="font-sans text-[16px] mb-4" style={{ color: "#5A5A50" }}>Job not found</p>
      <Link href="/" className="font-sans text-[14px]" style={{ color: "var(--color-ochre)" }}>← Back home</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(200,134,26,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 font-sans text-[13px] mb-8 transition-colors"
          style={{ color: "#5A5A50" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-cream)")}
          onMouseLeave={e => (e.currentTarget.style.color = "#5A5A50")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3L5 7l4 4"/></svg>
          Back
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left — job info */}
          <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-sans text-[12px] rounded-full px-3 py-1 font-medium"
                  style={{ backgroundColor: "rgba(200,134,26,0.08)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.15)" }}>
                  {job.category}
                </span>
                <span className="font-sans text-[12px] rounded-full px-3 py-1"
                  style={{ backgroundColor: job.status === "open" ? "rgba(46,204,106,0.08)" : "rgba(59,130,246,0.08)",
                    color: job.status === "open" ? "#2ECC6A" : "#3B82F6",
                    border: `1px solid ${job.status === "open" ? "rgba(46,204,106,0.15)" : "rgba(59,130,246,0.15)"}` }}>
                  {job.status === "open" ? "Open for bids" : job.status.replace("_", " ")}
                </span>
              </div>
              <h1 className="font-serif mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "var(--color-cream)", lineHeight: 1.2 }}>
                {job.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-sans text-[13px]" style={{ color: "#5A5A50" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {[job.lga, job.state].filter(Boolean).join(", ")}
                </span>
                <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{timeAgo(job.created_at)}</span>
                <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{job.bid_count} bid{job.bid_count !== 1 ? "s" : ""}</span>
              </div>
            </motion.div>

            {/* Photos */}
            {job.photos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-6">
                <div className="rounded-2xl overflow-hidden mb-2 aspect-video relative" style={{ backgroundColor: "#111110" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={job.photos[activePhoto].url} alt="" className="w-full h-full object-cover" />
                </div>
                {job.photos.length > 1 && (
                  <div className="flex gap-2">
                    {job.photos.map((p, i) => (
                      <button key={i} onClick={() => setActivePhoto(i)}
                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200"
                        style={{ opacity: i === activePhoto ? 1 : 0.5, border: `2px solid ${i === activePhoto ? "var(--color-ochre)" : "transparent"}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="rounded-2xl p-6 mb-4" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
              <h2 className="font-sans text-[15px] font-semibold mb-3" style={{ color: "var(--color-cream)" }}>About this job</h2>
              <p className="font-sans text-[14px] leading-relaxed" style={{ color: "#7A7A6A" }}>
                {job.description || "No description provided."}
              </p>
            </motion.div>

            {/* Meta */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-2xl p-6" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Budget", value: job.budget_amount ? `₦${Number(job.budget_amount).toLocaleString()}` : "Open to quotes" },
                  { label: "Timeline", value: job.timeline === "urgent" ? "Urgent — within 24h" : job.timeline === "week" ? "Within a week" : job.timeline === "flexible" ? "Flexible" : "—" },
                  { label: "Location", value: [job.lga, job.state].filter(Boolean).join(", ") || "—" },
                  { label: "Posted by", value: job.customer?.full_name || "Anonymous" },
                ].map(item => (
                  <div key={item.label}>
                    <p className="font-sans text-[11px] uppercase tracking-wider mb-1" style={{ color: "#5A5A50" }}>{item.label}</p>
                    <p className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — bid panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="lg:sticky lg:top-24 self-start">
            {job.status !== "open" ? (
              <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                <p className="font-sans text-[15px] font-semibold mb-2" style={{ color: "var(--color-cream)" }}>This job is no longer open</p>
                <p className="font-sans text-[13px] mb-5" style={{ color: "#5A5A50" }}>An artisan has already been hired.</p>
                <Link href="/post-job" className="block text-center h-11 leading-[44px] rounded-xl font-sans text-[14px] font-semibold"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                  Post your own job
                </Link>
              </div>
            ) : bidDone ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-6 text-center"
                style={{ background: "linear-gradient(135deg, rgba(46,204,106,0.08), rgba(46,204,106,0.02))", border: "1px solid rgba(46,204,106,0.2)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #2ECC6A, #27ae60)" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#0D0D0B" strokeWidth="2.5" strokeLinecap="round"><polyline points="4 11 8.5 15.5 18 6"/></svg>
                </div>
                <p className="font-sans text-[16px] font-semibold mb-1" style={{ color: "var(--color-cream)" }}>Quote submitted!</p>
                <p className="font-sans text-[13px] mb-5" style={{ color: "#5A5A50" }}>The customer will be notified and can accept your bid.</p>
                <button onClick={() => router.push("/artisan")} className="w-full h-10 rounded-xl font-sans text-[14px] font-medium"
                  style={{ backgroundColor: "#1B1B17", border: "1px solid #2A2A25", color: "var(--color-cream)" }}>
                  Back to dashboard
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.06), rgba(200,134,26,0.02))", border: "1px solid rgba(200,134,26,0.18)" }}>
                <h3 className="font-sans text-[16px] font-semibold mb-1" style={{ color: "var(--color-cream)" }}>
                  {userRole === "customer" ? "Job summary" : "Submit a quote"}
                </h3>
                <p className="font-sans text-[13px] mb-5" style={{ color: "#5A5A50" }}>
                  {userRole === "customer" ? "This is your job posting." : "Tell the customer what you'll charge and how you'll approach it."}
                </p>

                {userRole !== "customer" && (
                  <>
                    {job.budget_amount && (
                      <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: "#0D0D0B", border: "1px solid #1E1E1A" }}>
                        <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>Customer's budget</span>
                        <span className="font-mono text-[14px] font-semibold" style={{ color: "var(--color-ochre)" }}>
                          ₦{Number(job.budget_amount).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block font-sans text-[11px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: "#5A5A50" }}>Your price (₦)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: "var(--color-ochre)" }}>₦</span>
                        <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="0"
                          className="w-full h-12 rounded-xl pl-8 pr-4 font-sans text-[15px] outline-none transition-all"
                          style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block font-sans text-[11px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: "#5A5A50" }}>Message</label>
                      <textarea rows={3} value={bidMessage} onChange={e => setBidMessage(e.target.value)}
                        placeholder="Your experience, approach, and availability..."
                        className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none transition-all"
                        style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
                    </div>

                    {bidError && (
                      <p className="font-sans text-[12px] rounded-xl px-4 py-2 mb-4" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.15)" }}>
                        {bidError}
                      </p>
                    )}

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleBid} disabled={bidding || !bidAmount}
                      className="w-full h-12 rounded-xl font-sans text-[15px] font-semibold transition-all"
                      style={{ background: bidAmount ? "linear-gradient(135deg, #C8861A, #E8A040)" : "#1B1B17",
                        color: bidAmount ? "#0D0D0B" : "#3A3A33",
                        opacity: bidding ? 0.7 : 1,
                        boxShadow: bidAmount ? "0 4px 16px rgba(200,134,26,0.3)" : "none" }}>
                      {bidding ? "Submitting…" : "Submit Quote"}
                    </motion.button>

                    <p className="font-sans text-[11px] text-center mt-3" style={{ color: "#3A3A33" }}>
                      No payment until the customer accepts your bid
                    </p>
                  </>
                )}

                {!userRole && (
                  <div>
                    <p className="font-sans text-[13px] mb-4 text-center" style={{ color: "#5A5A50" }}>
                      Sign up as an artisan to submit a quote
                    </p>
                    <Link href="/signup" className="block text-center h-12 leading-[48px] rounded-xl font-sans text-[14px] font-semibold"
                      style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                      Join as Artisan — Free
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
