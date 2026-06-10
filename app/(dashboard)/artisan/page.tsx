"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { submitBid as submitBidToDb } from "@/lib/supabase/bids";
import NotificationBell from "@/components/dashboard/NotificationBell";
import DemoToggle from "@/components/dashboard/DemoToggle";
import MobileNav from "@/components/dashboard/MobileNav";
import VerificationFlow from "@/components/dashboard/VerificationFlow";
import { getFilterGroupOptions, matchesCategoryFilter } from "@/lib/categories";

const AVAILABLE_JOBS = [
  { id: "1", title: "Fix leaking kitchen pipe", category: "Plumbing", location: "Lagos Island, Lagos", budgetType: "fixed", budget: "₦15,000", photos: 2, posted: "2h ago", bids: 3, urgent: false },
  { id: "2", title: "Repaint fence and main gate", category: "Painting", location: "Lekki Phase 1, Lagos", budgetType: "open", budget: "Open to quotes", photos: 3, posted: "4h ago", bids: 1, urgent: false },
  { id: "3", title: "Rewire sitting room outlets", category: "Electrical", location: "Ikeja, Lagos", budgetType: "fixed", budget: "₦40,000", photos: 0, posted: "1h ago", bids: 5, urgent: true },
  { id: "4", title: "AC unit not cooling — urgent", category: "AC & HVAC", location: "Victoria Island, Lagos", budgetType: "fixed", budget: "₦20,000", photos: 1, posted: "30m ago", bids: 2, urgent: true },
  { id: "5", title: "Build custom wooden wardrobe", category: "Carpentry", location: "Surulere, Lagos", budgetType: "open", budget: "Open to quotes", photos: 4, posted: "6h ago", bids: 0, urgent: false },
  { id: "6", title: "Deep clean 3-bedroom apartment", category: "Cleaning", location: "Yaba, Lagos", budgetType: "fixed", budget: "₦25,000", photos: 2, posted: "3h ago", bids: 4, urgent: false },
  { id: "7", title: "Repair car alternator — Toyota Camry", category: "Auto Repair", location: "Gbagada, Lagos", budgetType: "open", budget: "Open to quotes", photos: 1, posted: "5h ago", bids: 2, urgent: false },
  { id: "8", title: "Fix burst water pipe in compound", category: "Plumbing", location: "Ikorodu, Lagos", budgetType: "fixed", budget: "₦18,000", photos: 3, posted: "1d ago", bids: 6, urgent: true },
];

const MY_BIDS = [
  { id: "mb1", title: "Install ceiling fans x3", location: "Gbagada, Lagos", category: "Electrical", myPrice: "₦18,000", status: "accepted", submitted: "2d ago", customer: "Adaeze O." },
  { id: "mb2", title: "Fix broken door frame", location: "Ikeja, Lagos", category: "Carpentry", myPrice: "₦8,500", status: "pending", submitted: "1d ago", customer: "Emmanuel K." },
  { id: "mb3", title: "Paint bedroom walls", location: "Lekki, Lagos", category: "Painting", myPrice: "₦35,000", status: "declined", submitted: "3d ago", customer: "Ngozi A." },
  { id: "mb4", title: "Tile bathroom floor", location: "VI, Lagos", category: "Construction", myPrice: "₦65,000", status: "pending", submitted: "5h ago", customer: "Bola T." },
  { id: "mb5", title: "Repair gas cooker", location: "Surulere, Lagos", category: "Appliances", myPrice: "₦12,000", status: "pending", submitted: "8h ago", customer: "Chidi N." },
];

const ACTIVE_JOBS = [
  { id: "aj1", title: "Install ceiling fans x3", customer: "Adaeze Obi", phone: "+234 803 456 7890", location: "Gbagada, Lagos", amount: "₦18,000", started: "Yesterday", progress: 70 },
];

const TRANSACTIONS = [
  { id: "t1", job: "Repaint 2-bedroom flat", amount: "+₦68,000", date: "Jun 1, 2026", status: "paid" },
  { id: "t2", job: "Fix burst pipe", amount: "+₦22,000", date: "May 28, 2026", status: "paid" },
  { id: "t3", job: "Install ceiling fans x3", amount: "+₦18,000", date: "In escrow", status: "escrow" },
  { id: "t4", job: "AC servicing (2 units)", amount: "+₦30,000", date: "May 20, 2026", status: "paid" },
  { id: "t5", job: "Tile kitchen floor", amount: "+₦45,000", date: "May 15, 2026", status: "paid" },
];

const CATEGORIES_FILTER = getFilterGroupOptions();

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  accepted: { label: "Accepted", color: "#2ECC6A", bg: "rgba(46,204,106,0.08)" },
  pending:  { label: "Pending", color: "#C8861A", bg: "rgba(200,134,26,0.08)" },
  declined: { label: "Declined", color: "#E84545", bg: "rgba(232,69,69,0.08)" },
};

const NAV = [
  { id: "overview",  label: "Overview",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: "browse",    label: "Browse Jobs", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { id: "mybids",    label: "My Bids",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id: "active",    label: "Active Jobs", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, badge: ACTIVE_JOBS.length },
  { id: "earnings",  label: "Earnings",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { id: "profile",   label: "Profile",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="12" height="12" viewBox="0 0 12 12" fill={n <= Math.round(rating) ? "var(--color-ochre)" : "none"} stroke="var(--color-ochre)" strokeWidth="1.2">
          <polygon points="6,1 7.8,4.2 11.5,4.6 8.8,7.2 9.6,11 6,9.1 2.4,11 3.2,7.2 0.5,4.6 4.2,4.2"/>
        </svg>
      ))}
      <span className="font-mono text-[11px] ml-1" style={{ color: "var(--color-ochre)" }}>{rating}</span>
    </span>
  );
}

export default function ArtisanDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [liveJobs, setLiveJobs] = useState<typeof AVAILABLE_JOBS>([]);
  const [liveMyBids, setLiveMyBids] = useState<typeof MY_BIDS>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "customer") { router.replace("/customer"); return; }
      setUserId(user.id);
    });
  }, [router]);

  function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const loadLiveData = useCallback(async () => {
    if (!userId) return;
    setLiveLoading(true);
    const supabase = createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, job_photos(count)")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    const { data: myBids } = await supabase
      .from("bids")
      .select("*, jobs(title, category, state, lga)")
      .eq("artisan_id", userId)
      .order("created_at", { ascending: false });

    setLiveJobs(
      (jobs ?? []).map((j: Record<string, unknown>) => ({
        id: j.id as string,
        title: j.title as string,
        category: j.category as string,
        location: [j.lga, j.state].filter(Boolean).join(", "),
        budgetType: j.budget_amount ? "fixed" : "open",
        budget: j.budget_amount ? `₦${Number(j.budget_amount).toLocaleString()}` : "Open to quotes",
        photos: (j.job_photos as Array<{ count: number }>)?.[0]?.count ?? 0,
        posted: timeAgo(j.created_at as string),
        bids: 0,
        urgent: false,
      }))
    );

    setLiveMyBids(
      (myBids ?? []).map((b: Record<string, unknown>) => {
        const job = b.jobs as Record<string, unknown> | null;
        return {
          id: b.id as string,
          title: (job?.title as string) ?? "Unknown job",
          location: [job?.lga, job?.state].filter(Boolean).join(", "),
          category: (job?.category as string) ?? "",
          myPrice: b.amount ? `₦${Number(b.amount).toLocaleString()}` : "—",
          status: b.status as string,
          submitted: timeAgo(b.created_at as string),
          customer: "Customer",
        };
      })
    );

    setLiveLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!demoMode && userId) loadLiveData();
  }, [demoMode, userId, loadLiveData]);

  const displayJobs = demoMode ? AVAILABLE_JOBS : liveJobs;
  const displayMyBids = demoMode ? MY_BIDS : liveMyBids;
  const [catFilter, setCatFilter] = useState("All");
  const [submittedBids, setSubmittedBids] = useState<Record<string, string>>({});
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [showBidModal, setShowBidModal] = useState<string | null>(null);

  const visibleJobs = catFilter === "All" ? displayJobs : displayJobs.filter(j => matchesCategoryFilter(j.category, catFilter));

  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [showVerification, setShowVerification] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidMessages, setBidMessages] = useState<Record<string, string>>({});

  const submitBid = async (jobId: string) => {
    const amount = bidInputs[jobId] || "";
    if (!amount) return;
    setBidError("");
    const msg = bidMessages[jobId] || "";
    const { error } = await submitBidToDb(jobId, Number(amount), msg);
    if (error) { setBidError(error); return; }
    setSubmittedBids(prev => ({ ...prev, [jobId]: amount }));
    setShowBidModal(null);
    if (!demoMode) loadLiveData();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#09090A" }}>
      {/* Sidebar */}
      <>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.aside
          className="fixed top-0 left-0 bottom-0 z-40 flex flex-col w-64 lg:hidden"
          initial={false}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ background: "linear-gradient(180deg, #0F0E0C 0%, #0A0A08 100%)", borderRight: "1px solid #1E1E1A" }}
        >
          <SidebarContent tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} />
        </motion.aside>

        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0"
          style={{ position: "sticky", top: 0, height: "100vh", background: "linear-gradient(180deg, #0F0E0C 0%, #0A0A08 100%)", borderRight: "1px solid #1E1E1A" }}
        >
          <SidebarContent tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} />
        </aside>
      </>

      {/* Bid modal */}
      <AnimatePresence>
        {showBidModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowBidModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-md rounded-2xl p-6"
                style={{ backgroundColor: "#141412", border: "1px solid #2A2A25" }}
                onClick={e => e.stopPropagation()}
              >
                {(() => {
                  const job = displayJobs.find(j => j.id === showBidModal);
                  if (!job) return null;
                  return (
                    <>
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-sans text-[16px] font-semibold mb-1" style={{ color: "var(--color-cream)" }}>Submit a Quote</h3>
                          <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{job.title}</p>
                        </div>
                        <button onClick={() => setShowBidModal(null)} style={{ color: "#5A5A50" }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/>
                          </svg>
                        </button>
                      </div>

                      <div className="rounded-xl p-3 mb-5" style={{ backgroundColor: "#0D0D0B", border: "1px solid #1E1E1A" }}>
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>Customer's budget</span>
                          <span className="font-mono text-[13px] font-semibold" style={{ color: job.budgetType === "fixed" ? "var(--color-ochre)" : "var(--color-cream)" }}>
                            {job.budget}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                          Your price (₦)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: "var(--color-ochre)" }}>₦</span>
                          <input
                            type="number"
                            value={bidInputs[showBidModal] || ""}
                            onChange={e => setBidInputs(prev => ({ ...prev, [showBidModal]: e.target.value }))}
                            placeholder="0"
                            className="w-full h-12 rounded-xl pl-9 pr-4 font-sans text-[15px] outline-none"
                            style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                          Proposal message
                        </label>
                        <textarea
                          rows={3}
                          value={bidMessages[showBidModal] || ""}
                          onChange={e => setBidMessages(prev => ({ ...prev, [showBidModal]: e.target.value }))}
                          placeholder="Describe your approach, experience, and availability..."
                          className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
                          style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                        />
                      </div>

                      {bidError && (
                        <p className="font-sans text-[12px] rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.15)" }}>
                          {bidError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => submitBid(showBidModal)}
                          className="flex-1 h-11 rounded-xl font-sans text-[14px] font-semibold"
                          style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", boxShadow: "0 4px 16px rgba(200,134,26,0.3)" }}
                        >
                          Submit Quote
                        </motion.button>
                        {job.budgetType === "fixed" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => { setBidInputs(prev => ({ ...prev, [showBidModal]: job.budget.replace(/[^0-9]/g,"") })); submitBid(showBidModal); }}
                            className="h-11 px-4 rounded-xl font-sans text-[13px] font-semibold"
                            style={{ backgroundColor: "rgba(200,134,26,0.1)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.2)" }}
                          >
                            Accept Price
                          </motion.button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b" style={{ borderColor: "#1E1E1A", backgroundColor: "#0F0E0C" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: "#5A5A50" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="16" x2="19" y2="16"/>
            </svg>
          </button>
          <span className="font-serif text-[18px]" style={{ color: "var(--color-ochre)" }}>FIXORA</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-[13px] font-semibold" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>EO</div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="relative px-6 lg:px-10 py-8 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.1) 0%, rgba(200,134,26,0.03) 40%, transparent 100%)", borderBottom: "1px solid #1E1E1A" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "200px", background: "radial-gradient(ellipse at top right, rgba(200,134,26,0.07) 0%, transparent 70%)" }} />
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--color-ochre)" }}>
                    {NAV.find(n => n.id === tab)?.label}
                  </p>
                  {verificationStatus === "verified" && (
                    <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "#2ECC6A" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2ECC6A" }} />
                      Verified
                    </span>
                  )}
                  {verificationStatus === "pending" && (
                    <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "#C8861A" }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#C8861A" }} />
                      Under Review
                    </span>
                  )}
                  {verificationStatus === "unverified" && (
                    <button onClick={() => setShowVerification(true)}
                      className="flex items-center gap-1 font-mono text-[10px] transition-opacity hover:opacity-80"
                      style={{ color: "#E84545" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#E84545" }} />
                      Not Verified
                    </button>
                  )}
                </div>
                <h1 className="font-serif" style={{ fontSize: "clamp(22px, 3vw, 32px)", color: "var(--color-cream)" }}>
                  {tab === "overview" ? "Good morning, Emeka" : NAV.find(n => n.id === tab)?.label}
                </h1>
                {tab === "overview" && (
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={4.8} />
                    <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>· 127 reviews · 42 jobs completed</span>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <DemoToggle demo={demoMode} onToggle={() => setDemoMode(d => !d)} />
                {userId && <NotificationBell userId={userId} />}
                <button
                  onClick={() => setTab("browse")}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl font-sans text-[14px] font-semibold transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", boxShadow: "0 4px 16px rgba(200,134,26,0.25)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.filter = "none")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Find Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Go Live banner */}
          <AnimatePresence>
            {verificationStatus === "unverified" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-6 lg:px-10 py-3 gap-4"
                style={{ backgroundColor: "rgba(232,69,69,0.06)", borderBottom: "1px solid rgba(232,69,69,0.12)" }}
              >
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E84545" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span className="font-sans text-[12px]" style={{ color: "#E84545" }}>
                    Your account is <strong>not yet verified</strong> — complete verification to start bidding on jobs.
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowVerification(true)}
                  className="flex-shrink-0 h-8 px-4 rounded-lg font-sans text-[12px] font-semibold"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                >
                  Go Live →
                </motion.button>
              </motion.div>
            )}
            {verificationStatus === "pending" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2.5 px-6 lg:px-10 py-3"
                style={{ backgroundColor: "rgba(200,134,26,0.05)", borderBottom: "1px solid rgba(200,134,26,0.1)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="font-sans text-[12px]" style={{ color: "var(--color-ochre)" }}>
                  Verification submitted — we'll notify you within <strong>24–48 hours</strong> once your account is approved.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo banner */}
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
                  ✦ Showing sample data — toggle <strong>Live</strong> to see real jobs in your area
                </span>
                <button onClick={() => setDemoMode(false)} className="font-semibold underline underline-offset-2" style={{ color: "var(--color-ochre)" }}>
                  Switch to Live
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 lg:px-10 py-8 pb-24 lg:pb-8">
            {liveLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
                  <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>Fetching live jobs…</span>
                </div>
              </div>
            ) : (
            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {/* Verification prompt card */}
                  {verificationStatus === "unverified" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
                      style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.1) 0%, rgba(200,134,26,0.03) 100%)", border: "1px solid rgba(200,134,26,0.2)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(200,134,26,0.12)", border: "1px solid rgba(200,134,26,0.2)" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-sans text-[14px] font-semibold mb-0.5" style={{ color: "var(--color-cream)" }}>Verify your account to go live</p>
                          <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>Takes ~3 minutes · NIN + face scan + profile setup</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowVerification(true)}
                        className="flex-shrink-0 h-9 px-5 rounded-xl font-sans text-[13px] font-semibold"
                        style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", boxShadow: "0 4px 16px rgba(200,134,26,0.2)" }}
                      >
                        Get Verified
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "Jobs Available", value: displayJobs.length.toString(), sub: "Near you", accent: "#C8861A", glow: "rgba(200,134,26,0.12)" },
                      { label: "Bids Sent", value: displayMyBids.length.toString(), sub: "This week", accent: "#3B82F6", glow: "rgba(59,130,246,0.1)" },
                      { label: "Jobs Won", value: "42", sub: "All time", accent: "#2ECC6A", glow: "rgba(46,204,106,0.1)" },
                      { label: "Total Earned", value: "₦248k", sub: "All time", accent: "#F59E0B", glow: "rgba(245,158,11,0.1)" },
                    ].map((stat, i) => (
                      <motion.div key={stat.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -2 }}
                        className="rounded-2xl p-5"
                        style={{ background: `linear-gradient(135deg, ${stat.glow} 0%, transparent 100%)`, border: `1px solid ${stat.glow}` }}
                      >
                        <p className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: stat.accent }}>{stat.sub}</p>
                        <p className="font-serif mb-1" style={{ fontSize: "34px", color: "var(--color-cream)", lineHeight: 1 }}>{stat.value}</p>
                        <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick apply jobs */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>Jobs Near You</h2>
                      <button onClick={() => setTab("browse")} className="font-sans text-[13px] transition-colors" style={{ color: "#5A5A50" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
                      >Browse all →</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {displayJobs.slice(0, 4).map((job, i) => (
                        <JobCard key={job.id} job={job} submitted={submittedBids[job.id]} onBid={() => setShowBidModal(job.id)} index={i} />
                      ))}
                    </div>
                  </div>

                  {/* Active job */}
                  {ACTIVE_JOBS.length > 0 && (
                    <div>
                      <h2 className="font-sans text-[16px] font-semibold mb-4" style={{ color: "var(--color-cream)" }}>Active Job</h2>
                      {ACTIVE_JOBS.map(job => <ActiveJobCard key={job.id} job={job} />)}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "browse" && (
                <motion.div key="browse" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>
                      Available Jobs <span className="font-mono text-[13px] ml-1" style={{ color: "#5A5A50" }}>({visibleJobs.length})</span>
                    </h2>
                  </div>
                  {/* Category filter chips */}
                  <div className="flex gap-2 flex-wrap mb-6">
                    {CATEGORIES_FILTER.map(cat => (
                      <button key={cat} onClick={() => setCatFilter(cat)}
                        className="h-8 px-4 rounded-full font-sans text-[12px] font-medium transition-all duration-200 cursor-pointer"
                        style={{
                          backgroundColor: catFilter === cat ? "rgba(200,134,26,0.15)" : "#111110",
                          border: `1px solid ${catFilter === cat ? "rgba(200,134,26,0.4)" : "#2A2A25"}`,
                          color: catFilter === cat ? "var(--color-ochre)" : "#5A5A50",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {visibleJobs.map((job, i) => (
                      <JobCard key={job.id} job={job} submitted={submittedBids[job.id]} onBid={() => setShowBidModal(job.id)} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "mybids" && (
                <motion.div key="mybids" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-sans text-[16px] font-semibold mb-5" style={{ color: "var(--color-cream)" }}>
                    My Bids <span className="font-mono text-[13px] ml-1" style={{ color: "#5A5A50" }}>({displayMyBids.length})</span>
                  </h2>
                  <div className="flex flex-col gap-2">
                    {displayMyBids.map((bid, i) => {
                      const cfg = STATUS_CFG[bid.status];
                      return (
                        <motion.div key={bid.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 transition-colors duration-200"
                          style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A25")}
                          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E1A")}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-[14px] font-semibold mb-0.5 truncate" style={{ color: "var(--color-cream)" }}>{bid.title}</p>
                            <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{bid.category} · {bid.location} · {bid.submitted}</p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="font-mono text-[14px] font-semibold" style={{ color: "var(--color-ochre)" }}>{bid.myPrice}</span>
                            <span className="font-sans text-[11px] rounded-full px-3 py-1 font-semibold"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {tab === "active" && (
                <motion.div key="active" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-sans text-[16px] font-semibold mb-5" style={{ color: "var(--color-cream)" }}>Active Jobs</h2>
                  {ACTIVE_JOBS.map(job => <ActiveJobCard key={job.id} job={job} detailed />)}
                </motion.div>
              )}

              {tab === "earnings" && (
                <motion.div key="earnings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {/* Wallet */}
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 rounded-2xl p-6 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15) 0%, rgba(200,134,26,0.04) 100%)", border: "1px solid rgba(200,134,26,0.2)" }}>
                      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                        style={{ background: "rgba(200,134,26,0.12)", transform: "translate(40%, -40%)" }} />
                      <p className="font-mono text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--color-ochre)" }}>Total Earned</p>
                      <p className="font-serif mb-1" style={{ fontSize: "48px", color: "var(--color-cream)", lineHeight: 1 }}>₦248,500</p>
                      <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>Across 42 completed jobs</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl p-4 flex-1" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                        <p className="font-sans text-[11px] uppercase tracking-wider mb-1" style={{ color: "#5A5A50" }}>This Month</p>
                        <p className="font-mono text-[22px] font-semibold" style={{ color: "#2ECC6A" }}>₦65,000</p>
                      </div>
                      <div className="rounded-2xl p-4 flex-1" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                        <p className="font-sans text-[11px] uppercase tracking-wider mb-1" style={{ color: "#5A5A50" }}>In Escrow</p>
                        <p className="font-mono text-[22px] font-semibold" style={{ color: "#3B82F6" }}>₦18,000</p>
                      </div>
                    </div>
                  </div>

                  <h2 className="font-sans text-[16px] font-semibold mb-4" style={{ color: "var(--color-cream)" }}>Transactions</h2>
                  <div className="flex flex-col gap-2">
                    {TRANSACTIONS.map((t, i) => (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl px-5 py-4 transition-colors duration-200"
                        style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A25")}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E1A")}
                      >
                        <div>
                          <p className="font-sans text-[14px] font-medium mb-0.5" style={{ color: "var(--color-cream)" }}>{t.job}</p>
                          <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{t.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[15px] font-semibold" style={{ color: t.status === "escrow" ? "#3B82F6" : "#2ECC6A" }}>{t.amount}</p>
                          <span className="font-sans text-[11px]" style={{ color: t.status === "escrow" ? "#3B82F6" : "#5A5A50" }}>
                            {t.status === "escrow" ? "In escrow" : "Paid"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="max-w-lg">
                    <div className="rounded-2xl p-6 mb-5" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.08), rgba(200,134,26,0.02))", border: "1px solid rgba(200,134,26,0.15)" }}>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-[24px]" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>E</div>
                        <div>
                          <h2 className="font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>Emeka Okafor</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Stars rating={4.8} />
                            <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>· 127 reviews</span>
                          </div>
                        </div>
                        {verificationStatus === "verified" && (
                          <div className="ml-auto flex items-center gap-1.5 font-sans text-[12px] rounded-full px-3 py-1" style={{ backgroundColor: "rgba(46,204,106,0.1)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.2)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Verified
                          </div>
                        )}
                        {verificationStatus === "pending" && (
                          <div className="ml-auto flex items-center gap-1.5 font-sans text-[12px] rounded-full px-3 py-1" style={{ backgroundColor: "rgba(200,134,26,0.1)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.2)" }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-ochre)" }} />
                            Under Review
                          </div>
                        )}
                        {verificationStatus === "unverified" && (
                          <button onClick={() => setShowVerification(true)}
                            className="ml-auto flex items-center gap-1.5 font-sans text-[12px] rounded-full px-3 py-1 transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.15)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Verify Now
                          </button>
                        )}
                      </div>
                      {[
                        { label: "Specialty", value: "Plumbing & General Repairs" },
                        { label: "Location", value: "Lagos Island, Lagos" },
                        { label: "Phone", value: "+234 802 345 6789" },
                        { label: "Member since", value: "January 2025" },
                        { label: "Jobs completed", value: "42" },
                        { label: "Response rate", value: "97%" },
                      ].map(f => (
                        <div key={f.label} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(200,134,26,0.1)" }}>
                          <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{f.label}</span>
                          <span className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>{f.value}</span>
                        </div>
                      ))}
                      <button className="mt-5 w-full h-10 rounded-xl font-sans text-[14px] font-semibold transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Verification flow modal */}
      <AnimatePresence>
        {showVerification && (
          <VerificationFlow
            onComplete={() => { setVerificationStatus("pending"); setShowVerification(false); }}
            onClose={() => setShowVerification(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <MobileNav
        active={tab}
        onSelect={setTab}
        items={[
          { id: "overview", label: "Overview", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
          { id: "browse", label: "Jobs", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { id: "mybids", label: "My Bids", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { id: "earnings", label: "Earnings", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
          { id: "profile", label: "Profile", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ]}
      />
    </div>
  );
}

function SidebarContent({ tab, setTab, setSidebarOpen }: { tab: string; setTab: (t: string) => void; setSidebarOpen: (v: boolean) => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 h-16 border-b flex-shrink-0" style={{ borderColor: "#1E1E1A" }}>
        <Link href="/" className="font-serif text-[20px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>
        <span className="font-sans text-[10px] rounded-full px-2 py-0.5 font-semibold" style={{ backgroundColor: "rgba(46,204,106,0.1)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.2)" }}>
          Artisan
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map(item => {
          const active = tab === item.id;
          return (
            <button key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 cursor-pointer"
              style={{
                background: active ? "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))" : "transparent",
                color: active ? "var(--color-ochre)" : "#5A5A50",
                border: active ? "1px solid rgba(200,134,26,0.2)" : "1px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.color = "var(--color-cream)"; (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.03)"; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.color = "#5A5A50"; (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; } }}
            >
              {item.icon}
              <span className="font-sans text-[14px] font-medium">{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="ml-auto text-[11px] font-mono rounded-full px-2 py-0.5 font-semibold"
                  style={{ backgroundColor: "rgba(200,134,26,0.15)", color: "var(--color-ochre)" }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "#1E1E1A" }}>
        <Link href="/" className="flex items-center justify-center gap-2 mb-3 font-sans text-[12px] transition-colors duration-200" style={{ color: "#5A5A50" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#7A7A6A")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#5A5A50")}
        >← Back to marketplace</Link>
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: "#131310", border: "1px solid #1E1E1A" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-sans text-[12px] font-semibold flex-shrink-0" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>EO</div>
          <div className="min-w-0">
            <p className="font-sans text-[13px] font-medium truncate" style={{ color: "var(--color-cream)" }}>Emeka Okafor</p>
            <p className="font-sans text-[11px] truncate" style={{ color: "#5A5A50" }}>Plumber · Lagos</p>
          </div>
        </div>
      </div>
    </>
  );
}

function JobCard({ job, submitted, onBid, index }: {
  job: typeof AVAILABLE_JOBS[0];
  submitted?: string;
  onBid: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(200,134,26,0.1)" }}
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A25")}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E1A")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-sans text-[11px] rounded-full px-2.5 py-0.5 font-medium"
              style={{ backgroundColor: "rgba(200,134,26,0.08)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.15)" }}>
              {job.category}
            </span>
            {job.urgent && (
              <span className="font-sans text-[10px] rounded-full px-2.5 py-0.5 font-semibold"
                style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.15)" }}>
                URGENT
              </span>
            )}
          </div>
          <h3 className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>{job.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[14px] font-semibold" style={{ color: job.budgetType === "open" ? "#5A5A50" : "var(--color-ochre)" }}>
            {job.budget}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {job.location}
        </span>
        {job.photos > 0 && (
          <span className="flex items-center gap-1 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {job.photos} photo{job.photos !== 1 ? "s" : ""}
          </span>
        )}
        <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{job.posted}</span>
        {job.bids > 0 && (
          <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>
            {job.bids} bid{job.bids !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold"
          style={{ backgroundColor: "rgba(46,204,106,0.08)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.15)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2 7 5.5 10.5 12 3.5"/></svg>
          Quote submitted — ₦{Number(submitted).toLocaleString()}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onBid}
          className="h-9 px-5 rounded-xl font-sans text-[13px] font-semibold w-full transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
        >
          {job.budgetType === "fixed" ? "Accept Price / Send Quote" : "Submit Quote"}
        </motion.button>
      )}
    </motion.div>
  );
}

function ActiveJobCard({ job, detailed = false }: { job: typeof ACTIVE_JOBS[0]; detailed?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))", border: "1px solid rgba(59,130,246,0.15)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#3B82F6" }} />
            <span className="font-mono text-[11px]" style={{ color: "#3B82F6" }}>IN PROGRESS</span>
          </div>
          <h3 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>{job.title}</h3>
          <p className="font-sans text-[13px] mt-0.5" style={{ color: "#5A5A50" }}>{job.location} · Started {job.started}</p>
        </div>
        <p className="font-mono text-[18px] font-semibold flex-shrink-0" style={{ color: "#2ECC6A" }}>{job.amount}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>Job progress</span>
          <span className="font-mono text-[12px]" style={{ color: "#3B82F6" }}>{job.progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1A" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>

      {detailed && (
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
            <p className="font-sans text-[11px] mb-0.5" style={{ color: "#5A5A50" }}>Customer</p>
            <p className="font-sans text-[13px] font-medium" style={{ color: "var(--color-cream)" }}>{job.customer}</p>
          </div>
          <a href={`tel:${job.phone}`}
            className="flex items-center justify-center gap-2 h-full rounded-xl px-4 font-sans text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(46,204,106,0.08)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.15)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16z"/></svg>
            Call
          </a>
        </div>
      )}
    </motion.div>
  );
}
