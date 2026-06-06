"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const TRADES = ["All trades", "Plumbing", "Electrical", "Painting", "Carpentry", "AC Repair", "Cleaning", "Tailoring", "Catering", "Auto Repair"];
const STATES = ["All states", "Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Delta", "Anambra", "Kaduna", "Enugu", "Imo"];

interface Artisan { id: string; full_name: string | null; trade: string | null; state: string | null; created_at: string; }

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={i <= n ? "var(--color-ochre)" : "none"} stroke="var(--color-ochre)" strokeWidth="1.2">
          <polygon points="6,1 7.8,4.2 11.5,4.6 8.8,7.2 9.6,11 6,9.1 2.4,11 3.2,7.2 0.5,4.6 4.2,4.2"/>
        </svg>
      ))}
    </span>
  );
}

export default function BrowseArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState("All trades");
  const [state, setState] = useState("All states");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from("profiles").select("id, full_name, trade, state, created_at").eq("role", "artisan").order("created_at", { ascending: false });
    if (trade !== "All trades") q = q.eq("trade", trade);
    if (state !== "All states") q = q.eq("state", state);
    const { data } = await q;
    setArtisans((data ?? []) as Artisan[]);
    setLoading(false);
  }, [trade, state]);

  useEffect(() => { load(); }, [load]);

  const filtered = search ? artisans.filter(a => a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.trade?.toLowerCase().includes(search.toLowerCase())) : artisans;

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(200,134,26,0.07) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--color-ochre)" }}>
            Find Artisans
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-serif mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--color-cream)" }}>
            Verified artisans across Nigeria
          </motion.h1>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A5A50" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or skill…"
              className="w-full h-10 rounded-xl pl-9 pr-4 font-sans text-[14px] outline-none transition-all"
              style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.4)")}
              onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")} />
          </div>
          <select value={trade} onChange={e => setTrade(e.target.value)}
            className="h-10 rounded-xl px-3 font-sans text-[13px] outline-none appearance-none cursor-pointer"
            style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)", minWidth: "140px" }}>
            {TRADES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={state} onChange={e => setState(e.target.value)}
            className="h-10 rounded-xl px-3 font-sans text-[13px] outline-none appearance-none cursor-pointer"
            style={{ backgroundColor: "#111110", border: "1px solid #2A2A25", color: "var(--color-cream)", minWidth: "140px" }}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="rounded-2xl h-44 animate-pulse" style={{ backgroundColor: "#111110" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans text-[15px]" style={{ color: "#5A5A50" }}>No artisans found — try different filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/artisans/${a.id}`} className="block rounded-2xl p-5 h-full transition-all duration-200"
                  style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,134,26,0.25)"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#141412"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1A"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#111110"; }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-[20px] mb-4"
                    style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                    {a.full_name?.charAt(0) ?? "A"}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>{a.full_name ?? "Artisan"}</p>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#2ECC6A" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p className="font-sans text-[13px] mb-2" style={{ color: "#5A5A50" }}>{a.trade ?? "Artisan"} · {a.state ?? "Nigeria"}</p>
                  <Stars n={5} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
