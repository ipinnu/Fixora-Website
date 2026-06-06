"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Bid { id: string; amount: number; message: string | null; artisan: { full_name: string | null; trade: string | null } | null; }

function PayPageContent() {
  const { jobId } = useParams<{ jobId: string }>();
  const params = useSearchParams();
  const bidId = params.get("bid");
  const router = useRouter();

  const [bid, setBid] = useState<Bid | null>(null);
  const [job, setJob] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bidId) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("bids").select("id, amount, message, artisan:profiles!artisan_id(full_name, trade)").eq("id", bidId).single(),
      supabase.from("jobs").select("title").eq("id", jobId).single(),
    ]).then(([{ data: b }, { data: j }]) => {
      const raw = b as Record<string, unknown> | null;
      if (raw) {
        const artisanRaw = Array.isArray(raw.artisan) ? (raw.artisan[0] ?? null) : raw.artisan;
        setBid({ ...raw, artisan: artisanRaw } as unknown as Bid);
      }
      setJob(j); setLoading(false);
    });
  }, [bidId, jobId]);

  const handlePay = async () => {
    if (!bid) return;
    setPaying(true); setError("");
    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidId: bid.id, jobId }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setPaying(false); return; }
    window.location.href = data.url;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
    </div>
  );

  if (!bid || !job) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#0D0D0B" }}>
      <p style={{ color: "#5A5A50" }}>Payment details not found.</p>
      <Link href="/customer" style={{ color: "var(--color-ochre)" }}>Back to dashboard</Link>
    </div>
  );

  const serviceFee = Math.round(bid.amount * 0.05);
  const total = bid.amount + serviceFee;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,134,26,0.08) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <Link href="/customer" className="inline-flex items-center gap-2 font-sans text-[13px] mb-8 transition-colors" style={{ color: "#5A5A50" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-cream)")} onMouseLeave={e => (e.currentTarget.style.color = "#5A5A50")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3L5 7l4 4"/></svg>
          Back to dashboard
        </Link>

        <h1 className="font-serif mb-1" style={{ fontSize: "28px", color: "var(--color-cream)" }}>Confirm & pay</h1>
        <p className="font-sans text-[14px] mb-8" style={{ color: "#5A5A50" }}>Funds are held in escrow until the job is complete</p>

        {/* Job + artisan */}
        <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
          <p className="font-sans text-[11px] uppercase tracking-wider mb-3" style={{ color: "#5A5A50" }}>Job</p>
          <p className="font-sans text-[15px] font-semibold mb-4" style={{ color: "var(--color-cream)" }}>{job.title}</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-sans text-[13px] font-semibold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.2), rgba(200,134,26,0.08))", color: "var(--color-ochre)" }}>
              {bid.artisan?.full_name?.charAt(0) ?? "A"}
            </div>
            <div>
              <p className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>{bid.artisan?.full_name ?? "Artisan"}</p>
              <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{bid.artisan?.trade ?? "Professional"}</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.07), rgba(200,134,26,0.02))", border: "1px solid rgba(200,134,26,0.15)" }}>
          {[
            { label: "Artisan's fee", value: `₦${bid.amount.toLocaleString()}` },
            { label: "Service fee (5%)", value: `₦${serviceFee.toLocaleString()}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "rgba(200,134,26,0.1)" }}>
              <span className="font-sans text-[14px]" style={{ color: "#7A7A6A" }}>{row.label}</span>
              <span className="font-mono text-[14px]" style={{ color: "var(--color-cream)" }}>{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <span className="font-sans text-[15px] font-semibold" style={{ color: "var(--color-cream)" }}>Total</span>
            <span className="font-mono text-[20px] font-semibold" style={{ color: "var(--color-ochre)" }}>₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3" style={{ backgroundColor: "rgba(46,204,106,0.06)", border: "1px solid rgba(46,204,106,0.15)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ECC6A" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p className="font-sans text-[12px]" style={{ color: "#2ECC6A" }}>
            Your payment is protected by escrow. Funds are only released to the artisan after you confirm the job is done.
          </p>
        </div>

        {error && <p className="font-sans text-[13px] rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>{error}</p>}

        <motion.button whileHover={{ scale: paying ? 1 : 1.02 }} whileTap={{ scale: paying ? 1 : 0.98 }} onClick={handlePay} disabled={paying}
          className="w-full h-14 rounded-xl font-sans text-[16px] font-semibold flex items-center justify-center gap-3 transition-all"
          style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", opacity: paying ? 0.7 : 1, boxShadow: "0 4px 24px rgba(200,134,26,0.3)" }}>
          {paying ? "Redirecting to Paystack…" : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Pay ₦{total.toLocaleString()} securely
            </>
          )}
        </motion.button>
        <p className="font-sans text-[11px] text-center mt-3" style={{ color: "#3A3A33" }}>Powered by Paystack · Your card details are never stored</p>
      </motion.div>
    </div>
  );
}

export default function PayPage() {
  return <Suspense><PayPageContent /></Suspense>;
}
