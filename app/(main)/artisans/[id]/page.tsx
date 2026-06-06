"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string; full_name: string | null; trade: string | null; state: string | null;
  phone: string | null; avatar_url: string | null; created_at: string;
}
interface Review { id: string; rating: number; comment: string | null; created_at: string; reviewer: { full_name: string | null } | null; }
interface Stats { completed: number; rating: number; review_count: number; }

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 12 12"
          fill={n <= Math.round(rating) ? "var(--color-ochre)" : "none"} stroke="var(--color-ochre)" strokeWidth="1.2">
          <polygon points="6,1 7.8,4.2 11.5,4.6 8.8,7.2 9.6,11 6,9.1 2.4,11 3.2,7.2 0.5,4.6 4.2,4.2"/>
        </svg>
      ))}
    </span>
  );
}

export default function ArtisanProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ completed: 0, rating: 0, review_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("*").eq("id", id).eq("role", "artisan").single(),
      supabase.from("reviews").select("id, rating, comment, created_at, reviewer:profiles!reviewer_id(full_name)").eq("artisan_id", id).order("created_at", { ascending: false }) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>,
      supabase.from("jobs").select("id", { count: "exact" }).eq("status", "completed")
        .in("id", supabase.from("bids").select("job_id").eq("artisan_id", id).eq("status", "accepted") as unknown as string[]),
    ]).then(([{ data: p }, { data: r }]) => {
      setProfile(p as Profile);
      const rv = (r ?? []) as unknown as Record<string, unknown>[];
      setReviews(rv.map(rec => ({ ...rec, reviewer: Array.isArray(rec.reviewer) ? (rec.reviewer[0] ?? null) : rec.reviewer })) as unknown as Review[]);
      const avg = rv.length ? rv.reduce((s, x) => s + (x as unknown as { rating: number }).rating, 0) / rv.length : 0;
      setStats({ completed: rv.length, rating: avg, review_count: rv.length });
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20" style={{ backgroundColor: "#0D0D0B" }}>
      <p style={{ color: "#5A5A50" }}>Artisan not found.</p>
      <Link href="/" style={{ color: "var(--color-ochre)" }}>← Back home</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(200,134,26,0.07) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 mb-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.08) 0%, rgba(200,134,26,0.02) 100%)", border: "1px solid rgba(200,134,26,0.15)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(200,134,26,0.06)", transform: "translate(40%, -40%)" }} />

          <div className="flex items-start gap-6 relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-serif text-[32px] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
              {profile.full_name?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-serif" style={{ fontSize: "clamp(22px, 3vw, 32px)", color: "var(--color-cream)" }}>
                  {profile.full_name ?? "Artisan"}
                </h1>
                <span className="flex items-center gap-1.5 font-sans text-[12px] rounded-full px-3 py-1 font-semibold"
                  style={{ backgroundColor: "rgba(46,204,106,0.1)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.2)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
              </div>
              <p className="font-sans text-[15px] mb-2" style={{ color: "#7A7A6A" }}>
                {profile.trade ?? "General Artisan"} · {profile.state ?? "Nigeria"}
              </p>
              {stats.review_count > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={stats.rating} />
                  <span className="font-mono text-[13px]" style={{ color: "var(--color-ochre)" }}>{stats.rating.toFixed(1)}</span>
                  <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>({stats.review_count} reviews)</span>
                </div>
              )}
            </div>
            <Link href="/post-job"
              className="hidden sm:flex items-center gap-2 h-10 px-5 rounded-xl font-sans text-[14px] font-semibold flex-shrink-0 transition-all"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", boxShadow: "0 4px 16px rgba(200,134,26,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
              Hire {profile.full_name?.split(" ")[0] ?? "them"}
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "rgba(200,134,26,0.1)" }}>
            {[
              { label: "Jobs done", value: stats.completed.toString() },
              { label: "Rating", value: stats.rating > 0 ? stats.rating.toFixed(1) : "—" },
              { label: "Member since", value: new Date(profile.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-serif" style={{ fontSize: "24px", color: "var(--color-cream)", lineHeight: 1 }}>{s.value}</p>
                <p className="font-sans text-[12px] mt-1" style={{ color: "#5A5A50" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <h2 className="font-sans text-[16px] font-semibold mb-4" style={{ color: "var(--color-cream)" }}>
            Reviews {reviews.length > 0 && <span className="font-mono text-[13px] ml-1" style={{ color: "#5A5A50" }}>({reviews.length})</span>}
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
              <p className="font-sans text-[14px]" style={{ color: "#3A3A33" }}>No reviews yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-sans text-[12px] font-semibold"
                        style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))", color: "var(--color-ochre)" }}>
                        {r.reviewer?.full_name?.charAt(0) ?? "C"}
                      </div>
                      <span className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>
                        {r.reviewer?.full_name ?? "Customer"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="font-mono text-[11px]" style={{ color: "#5A5A50" }}>
                        {new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  {r.comment && <p className="font-sans text-[14px] leading-relaxed" style={{ color: "#7A7A6A" }}>"{r.comment}"</p>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-8">
          <Link href="/post-job" className="block text-center h-12 leading-[48px] rounded-xl font-sans text-[15px] font-semibold"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
            Hire {profile.full_name?.split(" ")[0] ?? "this artisan"}
          </Link>
        </div>
      </div>
    </div>
  );
}
