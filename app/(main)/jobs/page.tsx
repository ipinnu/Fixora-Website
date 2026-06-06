"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["All", "Plumbing", "Electrical", "Painting", "AC & HVAC", "Carpentry", "Auto Repair", "Cleaning", "Appliances", "Tailoring", "Catering", "Construction", "General Repair"];
const STATES = ["All states", "Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Delta", "Anambra", "Kaduna", "Enugu", "Imo"];

interface Job {
  id: string; title: string; category: string; state: string; lga: string | null;
  budget_amount: number | null; status: string; created_at: string;
  photos: Array<{ url: string }>;
  bid_count: number;
}

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [state, setState] = useState("All states");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from("jobs").select("id, title, category, state, lga, budget_amount, status, created_at, photos:job_photos(url), bid_count:bids(count)").eq("status", "open").order("created_at", { ascending: false });
    if (cat !== "All") q = q.eq("category", cat);
    if (state !== "All states") q = q.eq("state", state);
    const { data } = await q;
    setJobs((data ?? []).map((j: Record<string, unknown>) => ({ ...j, bid_count: (j.bid_count as Array<{ count: number }>)?.[0]?.count ?? 0 })) as Job[]);
    setLoading(false);
  }, [cat, state]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(200,134,26,0.07) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--color-ochre)" }}>
            Browse Jobs
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-serif mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--color-cream)" }}>
            Jobs near you
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-sans text-[15px]" style={{ color: "#5A5A50" }}>
            {jobs.length} open job{jobs.length !== 1 ? "s" : ""} waiting for the right artisan
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-wrap flex-1">
            {CATEGORIES.slice(0, 7).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="h-8 px-4 rounded-full font-sans text-[12px] font-medium transition-all cursor-pointer"
                style={{ backgroundColor: cat === c ? "rgba(200,134,26,0.12)" : "#111110", border: `1px solid ${cat === c ? "rgba(200,134,26,0.4)" : "#2A2A25"}`, color: cat === c ? "var(--color-ochre)" : "#5A5A50" }}>
                {c}
              </button>
            ))}
          </div>
          <select value={state} onChange={e => setState(e.target.value)}
            className="h-8 rounded-xl px-3 font-sans text-[13px] outline-none appearance-none cursor-pointer"
            style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)", minWidth: "140px" }}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl h-48 animate-pulse" style={{ backgroundColor: "#111110" }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans text-[15px] mb-2" style={{ color: "var(--color-cream)" }}>No jobs found</p>
            <p className="font-sans text-[13px] mb-6" style={{ color: "#5A5A50" }}>Try a different category or state</p>
            <Link href="/post-job" className="inline-flex items-center gap-2 h-10 px-6 rounded-xl font-sans text-[14px] font-semibold"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
              Post the first job
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/jobs/${job.id}`} className="block rounded-2xl p-5 h-full transition-all duration-200 group"
                    style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2A2A25"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#141412"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1A"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#111110"; }}>
                    {job.photos[0] && (
                      <div className="rounded-xl overflow-hidden mb-4 aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={job.photos[0].url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                    )}
                    <span className="font-sans text-[11px] rounded-full px-2.5 py-1 mb-3 inline-block font-medium"
                      style={{ backgroundColor: "rgba(200,134,26,0.08)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.15)" }}>
                      {job.category}
                    </span>
                    <h3 className="font-sans text-[14px] font-semibold mb-2 leading-snug" style={{ color: "var(--color-cream)" }}>{job.title}</h3>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{[job.lga, job.state].filter(Boolean).join(", ")}</span>
                      <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{timeAgo(job.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[13px] font-semibold" style={{ color: job.budget_amount ? "var(--color-ochre)" : "#5A5A50" }}>
                        {job.budget_amount ? `₦${Number(job.budget_amount).toLocaleString()}` : "Open to quotes"}
                      </span>
                      <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{job.bid_count} bid{job.bid_count !== 1 ? "s" : ""}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
