"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "ipinnu.oladipo23@gmail.com";

interface User { id: string; full_name: string | null; role: string | null; state: string | null; trade: string | null; created_at: string; }
interface Job { id: string; title: string; category: string; state: string; status: string; created_at: string; budget_amount: number | null; }
interface Txn { id: string; amount: number; status: string; created_at: string; reference: string; }

const TABS = [
  { id: "users", label: "Users", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "jobs", label: "Jobs", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { id: "transactions", label: "Transactions", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { id: "verifications", label: "Verifications", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`, border: `1px solid ${accent}20` }}>
      <p className="font-mono text-[11px] uppercase tracking-wider mb-2" style={{ color: accent }}>{label}</p>
      <p className="font-serif" style={{ fontSize: "36px", color: "var(--color-cream)", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.replace("/"); return; }
      setLoading(false);
    });
  }, [router]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: u }, { data: j }, { data: t }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title, category, state, status, created_at, budget_amount").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers((u ?? []) as User[]);
    setJobs((j ?? []) as Job[]);
    setTxns((t ?? []) as Txn[]);
  }, []);

  useEffect(() => { if (!loading) load(); }, [loading, load]);

  const customers = users.filter(u => u.role === "customer");
  const artisans  = users.filter(u => u.role === "artisan");
  const revenue   = txns.filter(t => t.status === "in_escrow" || t.status === "paid").reduce((s, t) => s + t.amount * 0.05, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#09090A" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 lg:px-10 h-16 border-b" style={{ borderColor: "#1E1E1A", backgroundColor: "#0F0E0C" }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-serif text-[20px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>
          <span className="font-sans text-[11px] rounded-full px-2.5 py-1 font-semibold" style={{ backgroundColor: "rgba(232,69,69,0.1)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="font-sans text-[12px] h-8 px-3 rounded-lg transition-colors" style={{ backgroundColor: "#1B1B17", border: "1px solid #2A2A25", color: "#5A5A50" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cream)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}>
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total users" value={users.length.toString()} accent="#C8861A" />
          <StatCard label="Customers" value={customers.length.toString()} accent="#3B82F6" />
          <StatCard label="Artisans" value={artisans.length.toString()} accent="#2ECC6A" />
          <StatCard label="Revenue (5%)" value={`₦${Math.round(revenue).toLocaleString()}`} accent="#F59E0B" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl font-sans text-[13px] font-medium transition-all duration-200"
              style={{
                background: tab === t.id ? "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))" : "transparent",
                color: tab === t.id ? "var(--color-ochre)" : "#5A5A50",
                border: `1px solid ${tab === t.id ? "rgba(200,134,26,0.25)" : "#2A2A25"}`,
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1E1E1A" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#111110", borderBottom: "1px solid #1E1E1A" }}>
                      {["Name", "Role", "Trade/State", "Joined"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wider" style={{ color: "#5A5A50" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? "#0F0F0D" : "#111110", borderBottom: "1px solid #1E1E1A" }}>
                        <td className="px-4 py-3 font-sans text-[13px]" style={{ color: "var(--color-cream)" }}>{u.full_name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[11px] rounded-full px-2.5 py-1 font-semibold"
                            style={{ backgroundColor: u.role === "artisan" ? "rgba(46,204,106,0.08)" : "rgba(59,130,246,0.08)", color: u.role === "artisan" ? "#2ECC6A" : "#3B82F6" }}>
                            {u.role ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px]" style={{ color: "#5A5A50" }}>{u.trade ?? u.state ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "#5A5A50" }}>
                          {new Date(u.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1E1E1A" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#111110", borderBottom: "1px solid #1E1E1A" }}>
                      {["Job", "Category", "Location", "Status", "Budget", "Posted"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wider" style={{ color: "#5A5A50" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j, i) => (
                      <tr key={j.id} style={{ backgroundColor: i % 2 === 0 ? "#0F0F0D" : "#111110", borderBottom: "1px solid #1E1E1A" }}>
                        <td className="px-4 py-3 font-sans text-[13px] max-w-[200px] truncate" style={{ color: "var(--color-cream)" }}>{j.title}</td>
                        <td className="px-4 py-3 font-sans text-[12px]" style={{ color: "#5A5A50" }}>{j.category}</td>
                        <td className="px-4 py-3 font-sans text-[12px]" style={{ color: "#5A5A50" }}>{j.state}</td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[11px] rounded-full px-2.5 py-1"
                            style={{ backgroundColor: j.status === "open" ? "rgba(46,204,106,0.08)" : j.status === "in_progress" ? "rgba(59,130,246,0.08)" : "rgba(122,122,106,0.1)", color: j.status === "open" ? "#2ECC6A" : j.status === "in_progress" ? "#3B82F6" : "#7A7A6A" }}>
                            {j.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "#5A5A50" }}>
                          {j.budget_amount ? `₦${Number(j.budget_amount).toLocaleString()}` : "Open"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "#5A5A50" }}>
                          {new Date(j.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1E1E1A" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#111110", borderBottom: "1px solid #1E1E1A" }}>
                      {["Reference", "Amount", "Fee (5%)", "Status", "Date"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wider" style={{ color: "#5A5A50" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t, i) => (
                      <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? "#0F0F0D" : "#111110", borderBottom: "1px solid #1E1E1A" }}>
                        <td className="px-4 py-3 font-mono text-[11px]" style={{ color: "#5A5A50" }}>{t.reference.slice(0, 20)}…</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold" style={{ color: "var(--color-ochre)" }}>₦{Number(t.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "#2ECC6A" }}>₦{Math.round(t.amount * 0.05).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[11px] rounded-full px-2.5 py-1"
                            style={{ backgroundColor: t.status === "paid" ? "rgba(46,204,106,0.08)" : t.status === "in_escrow" ? "rgba(59,130,246,0.08)" : "rgba(122,122,106,0.1)", color: t.status === "paid" ? "#2ECC6A" : t.status === "in_escrow" ? "#3B82F6" : "#7A7A6A" }}>
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "#5A5A50" }}>
                          {new Date(t.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "verifications" && (
            <motion.div key="verifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                <p className="font-sans text-[14px] mb-2" style={{ color: "var(--color-cream)" }}>Verification queue</p>
                <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>
                  Artisans who have submitted ID documents for verification will appear here. This feature requires ID upload in the artisan profile flow.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
