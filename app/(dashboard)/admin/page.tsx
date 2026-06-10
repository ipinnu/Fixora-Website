"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession, getDemoSession } from "@/lib/demo-session";
import {
  loadDemoAdminData,
  type DemoAdminJob,
  type DemoAdminUser,
} from "@/lib/demo-admin";
import VerificationReviewPanel from "@/components/admin/VerificationReviewPanel";
import TransactionReviewPanel from "@/components/admin/TransactionReviewPanel";
import { fetchAllVerifications, reviewVerification, type ArtisanVerificationRow } from "@/lib/supabase/verification";
import {
  fetchAllTransactionsWithCompletions,
  adminReviewProofAndRelease,
  type TransactionWithCompletion,
} from "@/lib/supabase/completions";
import DemoToggle from "@/components/dashboard/DemoToggle";

const ADMIN_EMAIL = "ipinnu.oladipo23@gmail.com";

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
  const [users, setUsers] = useState<DemoAdminUser[]>([]);
  const [jobs, setJobs] = useState<DemoAdminJob[]>([]);
  const [txns, setTxns] = useState<TransactionWithCompletion[]>([]);
  const [verifications, setVerifications] = useState<ArtisanVerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [isDemoSession, setIsDemoSession] = useState(false);

  useEffect(() => {
    if (getDemoSession() === "admin") {
      setIsDemoSession(true);
      setDemoMode(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) { router.replace("/"); return; }
      setLoading(false);
    });
  }, [router]);

  const loadDemo = useCallback(() => {
    const data = loadDemoAdminData();
    setUsers(data.users);
    setJobs(data.jobs);
    setTxns(data.txns);
    setVerifications(data.verifications);
  }, []);

  const load = useCallback(async () => {
    if (demoMode) {
      loadDemo();
      return;
    }
    const supabase = createClient();
    const [{ data: u }, { data: j }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title, category, state, status, created_at, budget_amount").order("created_at", { ascending: false }),
    ]);
    setUsers((u ?? []) as DemoAdminUser[]);
    setJobs((j ?? []) as DemoAdminJob[]);
    const txnRows = await fetchAllTransactionsWithCompletions();
    setTxns(txnRows);
    const rows = await fetchAllVerifications();
    setVerifications(rows);
  }, [demoMode, loadDemo]);

  const handleReview = async (id: string, artisanId: string, decision: "approved" | "rejected", notes?: string) => {
    const { error } = await reviewVerification(id, artisanId, decision, notes);
    if (!error) await load();
  };

  const handlePaymentReview = async (
    completionId: string,
    transactionId: string,
    jobId: string,
    decision: "approved" | "rejected",
    notes?: string,
  ) => {
    const { error } = await adminReviewProofAndRelease(completionId, transactionId, jobId, decision, notes);
    if (!error) await load();
  };

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
          <DemoToggle demo={demoMode} onToggle={() => setDemoMode((d) => !d)} />
          {isDemoSession && (
            <Link
              href="/login"
              onClick={() => clearDemoSession()}
              className="font-sans text-[12px] h-8 px-3 rounded-lg transition-colors"
              style={{ backgroundColor: "#1B1B17", border: "1px solid #2A2A25", color: "#5A5A50" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#5A5A50")}
            >
              Exit demo
            </Link>
          )}
          <button onClick={load} className="font-sans text-[12px] h-8 px-3 rounded-lg transition-colors" style={{ backgroundColor: "#1B1B17", border: "1px solid #2A2A25", color: "#5A5A50" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cream)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}>
            Refresh
          </button>
        </div>
      </div>

      <AnimatePresence>
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-6 lg:px-10 py-2.5 text-[12px] font-sans"
            style={{ backgroundColor: "rgba(200,134,26,0.07)", borderBottom: "1px solid rgba(200,134,26,0.12)" }}
          >
            <span style={{ color: "var(--color-ochre)" }}>
              ✦ Showing sample platform data — toggle <strong>Live</strong> to see real users, jobs, transactions, and verifications
            </span>
            <button
              type="button"
              onClick={() => setDemoMode(false)}
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--color-ochre)" }}
            >
              Switch to Live
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                        <th key={h} className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wider" style={{ color: "rgba(242,237,223,0.35)" }}>{h}</th>
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
                        <td className="px-4 py-3 font-sans text-[13px]" style={{ color: "rgba(242,237,223,0.55)" }}>{u.trade ?? u.state ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "rgba(242,237,223,0.4)" }}>
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
                        <th key={h} className="px-4 py-3 text-left font-sans text-[11px] uppercase tracking-wider" style={{ color: "rgba(242,237,223,0.35)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j, i) => (
                      <tr key={j.id} style={{ backgroundColor: i % 2 === 0 ? "#0F0F0D" : "#111110", borderBottom: "1px solid #1E1E1A" }}>
                        <td className="px-4 py-3 font-sans text-[13px] max-w-[200px] truncate" style={{ color: "var(--color-cream)" }}>{j.title}</td>
                        <td className="px-4 py-3 font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.55)" }}>{j.category}</td>
                        <td className="px-4 py-3 font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.55)" }}>{j.state}</td>
                        <td className="px-4 py-3">
                          <span className="font-sans text-[11px] rounded-full px-2.5 py-1"
                            style={{ backgroundColor: j.status === "open" ? "rgba(46,204,106,0.08)" : j.status === "in_progress" ? "rgba(59,130,246,0.08)" : "rgba(122,122,106,0.1)", color: j.status === "open" ? "#2ECC6A" : j.status === "in_progress" ? "#3B82F6" : "#7A7A6A" }}>
                            {j.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "rgba(242,237,223,0.55)" }}>
                          {j.budget_amount ? `₦${Number(j.budget_amount).toLocaleString()}` : "Open"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "rgba(242,237,223,0.4)" }}>
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
              <TransactionReviewPanel
                transactions={txns}
                demoMode={demoMode}
                onReview={handlePaymentReview}
              />
            </motion.div>
          )}

          {tab === "verifications" && (
            <motion.div key="verifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <VerificationReviewPanel
                verifications={verifications}
                demoMode={demoMode}
                onReview={handleReview}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
