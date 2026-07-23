"use client";

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { acceptBid as acceptBidInDb, declineBid as declineBidInDb } from "@/lib/supabase/bids";
import DemoPreviewBanner from "@/components/dashboard/DemoPreviewBanner";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import MobileNav from "@/components/dashboard/MobileNav";
import { DEMO_PROFILES, clearDemoSession, getDemoSession } from "@/lib/demo-session";

const JOBS = [
  { id: "1", title: "Fix leaking kitchen pipe", category: "Plumbing", location: "Lagos Island", bids: 3, status: "reviewing", posted: "2h ago", budget: "₦15,000", photos: 2 },
  { id: "2", title: "Paint 3-bedroom flat", category: "Painting", location: "Wuse II, Abuja", bids: 7, status: "reviewing", posted: "1d ago", budget: "Open to quotes", photos: 4 },
  { id: "3", title: "Install split AC unit", category: "AC & HVAC", location: "Port Harcourt", bids: 2, status: "in_progress", posted: "3d ago", budget: "₦45,000", photos: 0 },
  { id: "4", title: "Repair car alternator", category: "Auto Repair", location: "Surulere, Lagos", bids: 0, status: "pending", posted: "15m ago", budget: "₦20,000", photos: 1 },
  { id: "5", title: "Install ceiling fans x3", category: "Electrical", location: "Ibadan", bids: 5, status: "completed", posted: "1w ago", budget: "₦18,000", photos: 0 },
];

const OFFER_COVER_IMAGES = ["/Image client.jpg", "/Image client 2.jpg"];

const BIDS = [
  { id: "b1", jobId: "2", jobTitle: "Paint 3-bedroom flat", artisan: "Emeka Okafor", rating: 4.9, reviews: 127, price: "₦85,000", message: "I can start on Monday. I use premium Dulux paints and my team of 2 will ensure a clean finish within 3 days.", submitted: "3h ago", initials: "EO", verified: true, coverImage: OFFER_COVER_IMAGES[0] },
  { id: "b2", jobId: "2", jobTitle: "Paint 3-bedroom flat", artisan: "Tunde Adeyemi", rating: 4.7, reviews: 89, price: "₦72,000", message: "15 years of professional painting experience. I'll do a full assessment before we begin and guarantee satisfaction.", submitted: "5h ago", initials: "TA", verified: true, coverImage: OFFER_COVER_IMAGES[1] },
  { id: "b3", jobId: "2", jobTitle: "Paint 3-bedroom flat", artisan: "Chijioke Eze", rating: 4.8, reviews: 203, price: "₦90,000", message: "Premium Berger materials included in quote. 100% satisfaction guaranteed with a 3-month touch-up warranty.", submitted: "6h ago", initials: "CE", verified: false },
  { id: "b4", jobId: "1", jobTitle: "Fix leaking kitchen pipe", artisan: "Suleiman Musa", rating: 4.6, reviews: 54, price: "₦12,000", message: "I can fix this same day. Available from 10am tomorrow. I carry all common pipe fittings.", submitted: "1h ago", initials: "SM", verified: true },
  { id: "b5", jobId: "1", jobTitle: "Fix leaking kitchen pipe", artisan: "Chidi Nwosu", rating: 4.9, reviews: 178, price: "₦15,000", message: "Includes full pipe section replacement and pressure test to ensure no future leaks.", submitted: "2h ago", initials: "CN", verified: true },
];

const PAYMENTS = [
  { id: "p1", job: "Install ceiling fans x3", artisan: "Dele Okafor", amount: "₦18,000", date: "May 25, 2026", status: "released" },
  { id: "p2", job: "Tile bathroom floor", artisan: "Emeka Eze", amount: "₦65,000", date: "May 10, 2026", status: "released" },
  { id: "p3", job: "Install split AC unit", artisan: "Yusuf Bello", amount: "₦45,000", date: "In escrow", status: "escrow" },
  { id: "p4", job: "Fix burst pipe", artisan: "Chukwuma Obi", amount: "₦22,000", date: "Apr 18, 2026", status: "released" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Posted", color: "#7A7A6A", bg: "rgba(122,122,106,0.1)" },
  reviewing:   { label: "Reviewing Offers", color: "#C8861A", bg: "rgba(200,134,26,0.1)" },
  in_progress: { label: "In Progress", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  completed:   { label: "Completed", color: "#2ECC6A", bg: "rgba(46,204,106,0.1)" },
};

const NAV = [
  { id: "overview", label: "Overview", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: "jobs", label: "My Tasks", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { id: "bids", label: "Offers for Me", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: "payments", label: "Payments", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: "profile", label: "Profile", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
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

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className="inline-flex items-center rounded-full font-sans text-[11px] font-semibold">
      <span style={{ color: cfg.color, backgroundColor: cfg.bg, padding: "2px 10px", borderRadius: "999px" }}>
        {cfg.label}
      </span>
    </span>
  );
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface CustomerProfile {
  fullName: string | null;
  email: string | null;
  state: string | null;
  phone: string | null;
}

function getFirstName(fullName: string | null): string {
  if (!fullName?.trim()) return "there";
  return fullName.trim().split(/\s+/)[0];
}

function getInitials(fullName: string | null, email: string | null): string {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [acceptedBids, setAcceptedBids] = useState<string[]>([]);
  const [declinedBids, setDeclinedBids] = useState<string[]>([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [isPreviewSession, setIsPreviewSession] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [liveJobs, setLiveJobs] = useState<typeof JOBS>([]);
  const [liveBids, setLiveBids] = useState<typeof BIDS>([]);
  const [livePayments, setLivePayments] = useState<typeof PAYMENTS>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ fullName: "", state: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        clearDemoSession();
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("full_name, role, state, phone")
          .eq("id", user.id)
          .single();
        if (profileRow?.role === "artisan") { router.replace("/artisan"); return; }
        setUserId(user.id);
        setDemoMode(false);
        setIsPreviewSession(false);
        setProfile({
          fullName: profileRow?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
          email: user.email ?? null,
          state: profileRow?.state ?? null,
          phone: profileRow?.phone ?? null,
        });
        return;
      }

      const demoRole = getDemoSession();
      if (demoRole === "customer") {
        setIsPreviewSession(true);
        setDemoMode(true);
        setProfile(DEMO_PROFILES.customer);
        return;
      }
      if (demoRole === "artisan") { router.replace("/artisan"); return; }
      if (demoRole === "admin") { router.replace("/admin"); return; }

      router.replace("/login");
    });
  }, [router]);

  const startProfileEdit = () => {
    if (!profile || demoMode) return;
    setProfileDraft({
      fullName: profile.fullName ?? "",
      state: profile.state ?? "",
      phone: profile.phone ?? "",
    });
    setProfileMessage("");
    setEditingProfile(true);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    const fullName = profileDraft.fullName.trim();
    const state = profileDraft.state.trim();
    const phone = profileDraft.phone.trim();
    if (!fullName) {
      setProfileMessage("Please enter your full name.");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        state: state || null,
        phone: phone || null,
      })
      .eq("id", userId);

    if (error) {
      setProfileMessage(error.message);
      setProfileSaving(false);
      return;
    }

    setProfile((current) => current ? {
      ...current,
      fullName,
      state: state || null,
      phone: phone || null,
    } : current);
    setEditingProfile(false);
    setProfileSaving(false);
    setProfileMessage("Profile updated.");
  };

  const loadLiveData = useCallback(async () => {
    if (!userId) return;
    setLiveLoading(true);
    const supabase = createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, job_photos(url), bids(count)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    const jobIds = jobs?.map((j: { id: string }) => j.id) ?? [];

    const { data: bids } = jobIds.length
      ? await supabase
          .from("bids")
          .select("*, artisan:profiles(full_name)")
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })
      : { data: [] };

    setLiveJobs(
      (jobs ?? []).map((j: Record<string, unknown>) => ({
        id: j.id as string,
        title: j.title as string,
        category: j.category as string,
        location: [j.lga, j.state].filter(Boolean).join(", "),
        bids: (j.bids as Array<{ count: number }>)?.[0]?.count ?? 0,
        status: j.status as string,
        posted: timeAgo(j.created_at as string),
        budget: j.budget_amount ? `₦${Number(j.budget_amount).toLocaleString()}` : "Open to quotes",
        photos: (j.job_photos as Array<{ url: string }>)?.length ?? 0,
      }))
    );

    setLiveBids(
      (bids ?? []).map((b: Record<string, unknown>) => {
        const name = (b.artisan as { full_name?: string } | null)?.full_name ?? "Artisan";
        const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
        const job = jobs?.find((j: { id: string }) => j.id === b.job_id) as Record<string, unknown> | undefined;
        const jobPhotos = (job?.job_photos as Array<{ url: string }>) ?? [];
        const bidIndex = (bids ?? []).findIndex((x: { id: string }) => x.id === b.id);
        return {
          id: b.id as string,
          jobId: b.job_id as string,
          jobTitle: (job?.title as string) ?? "",
          artisan: name,
          rating: 0,
          reviews: 0,
          price: b.amount ? `₦${Number(b.amount).toLocaleString()}` : "—",
          message: (b.message as string) ?? "",
          submitted: timeAgo(b.created_at as string),
          initials,
          verified: false,
          coverImage: jobPhotos[0]?.url ?? OFFER_COVER_IMAGES[bidIndex % OFFER_COVER_IMAGES.length],
        };
      })
    );

    const { data: txns } = await supabase
      .from("transactions")
      .select("*, bids(job_id, jobs(title), artisan:profiles(full_name))")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    setLivePayments(
      (txns ?? []).map((t: Record<string, unknown>) => {
        const bid = t.bids as Record<string, unknown> | null;
        const job = bid?.jobs as Record<string, unknown> | null;
        const artisan = bid?.artisan as { full_name?: string } | null;
        return {
          id: t.id as string,
          job: (job?.title as string) ?? "Job",
          artisan: artisan?.full_name ?? "Artisan",
          amount: `₦${Number(t.amount).toLocaleString()}`,
          date: t.status === "in_escrow" ? "In escrow" : new Date(t.created_at as string).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }),
          status: (t.status as string) === "in_escrow" ? "escrow" : "released",
        };
      })
    );

    setLiveLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!demoMode && userId) loadLiveData();
  }, [demoMode, userId, loadLiveData]);

  const jobs = demoMode ? JOBS : liveJobs;
  const bids = demoMode ? BIDS : liveBids;
  const payments = demoMode ? PAYMENTS : livePayments;

  const filteredBids = selectedJobFilter === "all"
    ? bids
    : bids.filter(b => b.jobId === selectedJobFilter);

  const displayName = getFirstName(profile?.fullName ?? null);
  const initials = getInitials(profile?.fullName ?? null, profile?.email ?? null);

  const pageTitle = () => {
    if (tab === "overview") return `Welcome back, ${displayName}`;
    if (tab === "jobs") return "My Tasks";
    if (tab === "bids") return "Offers for Me";
    return NAV.find(n => n.id === tab)?.label ?? "";
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#09090A" }}>
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
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
          className="fixed top-0 left-0 bottom-0 z-40 flex flex-col w-64"
          initial={false}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            background: "linear-gradient(180deg, #0F0E0C 0%, #0A0A08 100%)",
            borderRight: "1px solid #1E1E1A",
          }}
        >
          <SidebarContent tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} profile={profile} initials={initials} />
        </motion.aside>

        {/* Desktop sidebar — always visible */}
        <aside
          className="hidden lg:flex flex-col w-64 flex-shrink-0"
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            background: "linear-gradient(180deg, #0F0E0C 0%, #0A0A08 100%)",
            borderRight: "1px solid #1E1E1A",
          }}
        >
          <SidebarContent tab={tab} setTab={setTab} setSidebarOpen={setSidebarOpen} profile={profile} initials={initials} />
        </aside>
      </>

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
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-[13px] font-semibold" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>{initials}</div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Gradient header */}
          <div className="relative px-6 lg:px-10 py-8 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.12) 0%, rgba(200,134,26,0.04) 40%, transparent 100%)", borderBottom: "1px solid #1E1E1A" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "200px", background: "radial-gradient(ellipse at top right, rgba(200,134,26,0.08) 0%, transparent 70%)" }} />
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--color-ochre)" }}>
                  {NAV.find(n => n.id === tab)?.label}
                </p>
                <h1 className="font-serif" style={{ fontSize: "clamp(22px, 3vw, 32px)", color: "var(--color-cream)" }}>
                  {pageTitle()}
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/post-job"
                  className="flex items-center gap-2 h-10 px-5 rounded-xl font-sans text-[14px] font-semibold transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B", boxShadow: "0 4px 16px rgba(200,134,26,0.25)" }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
                  </svg>
                  Post a Task
                </Link>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isPreviewSession && <DemoPreviewBanner role="customer" />}
          </AnimatePresence>

          {/* Tab content */}
          <div className="px-6 lg:px-10 py-8 pb-24 lg:pb-8">
            {liveLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(200,134,26,0.3)", borderTopColor: "var(--color-ochre)" }} />
                  <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>Loading your data…</span>
                </div>
              </div>
            ) : (
            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "Open Tasks", value: jobs.filter(j => j.status !== "completed").length.toString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, glow: "rgba(200,134,26,0.12)" },
                      { label: "Offers In", value: bids.length.toString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, glow: "rgba(200,134,26,0.1)" },
                      { label: "Underway", value: jobs.filter(j => j.status === "in_progress").length.toString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, glow: "rgba(232,160,64,0.1)" },
                      { label: "Done", value: jobs.filter(j => j.status === "completed").length.toString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, glow: "rgba(200,134,26,0.08)" },
                    ].map(stat => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="rounded-2xl p-5"
                        style={{ background: `linear-gradient(135deg, ${stat.glow} 0%, rgba(255,255,255,0.01) 100%)`, border: `1px solid ${stat.glow}` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span style={{ color: "var(--color-ochre)" }}>{stat.icon}</span>
                          <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "#3A3A33" }}>
                            {stat.label === "Done" ? "all time" : "active"}
                          </span>
                        </div>
                        <p className="font-serif" style={{ fontSize: "36px", color: "var(--color-cream)", lineHeight: 1 }}>{stat.value}</p>
                        <p className="font-sans text-[13px] mt-1" style={{ color: "rgba(242,237,223,0.45)" }}>{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent tasks */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>My Recent Tasks</h2>
                      <button onClick={() => setTab("jobs")} className="font-sans text-[13px] transition-colors" style={{ color: "#5A5A50" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
                      >View all →</button>
                    </div>
                    <JobTable jobs={jobs.slice(0, 4)} emptyState={
                      !demoMode && jobs.length === 0 ? (
                        <DashboardEmptyState
                          title="No tasks yet"
                          description="Post your first home repair or service task to start receiving offers from verified artisans."
                          action={
                            <Link href="/post-job" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold"
                              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                              Post your first task
                            </Link>
                          }
                        />
                      ) : undefined
                    } />
                  </div>

                  {/* Recent offers */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>Latest Offers</h2>
                      <button onClick={() => setTab("bids")} className="font-sans text-[13px] transition-colors" style={{ color: "#5A5A50" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-ochre)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
                      >View all →</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {!demoMode && bids.length === 0 ? (
                        <div className="md:col-span-2">
                          <DashboardEmptyState
                            title="No offers yet"
                            description="When artisans bid on your tasks, their offers will appear here for you to review."
                          />
                        </div>
                      ) : bids.slice(0, 2).map(bid => (
                        <BidCard key={bid.id} bid={bid} accepted={acceptedBids.includes(bid.id)} declined={declinedBids.includes(bid.id)}
                          onAccept={async () => { if (!demoMode) await acceptBidInDb(bid.id, bid.jobId); setAcceptedBids(p => [...p, bid.id]); }}
                          onDecline={async () => { if (!demoMode) await declineBidInDb(bid.id); setDeclinedBids(p => [...p, bid.id]); }}
                          showJobTitle
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === "jobs" && (
                <motion.div key="jobs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>All My Tasks <span className="font-mono text-[13px] ml-1" style={{ color: "#5A5A50" }}>({jobs.length})</span></h2>
                    <Link href="/post-job" className="flex items-center gap-1.5 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold"
                      style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                      + Post new task
                    </Link>
                  </div>
                  <JobTable
                    jobs={jobs}
                    emptyState={
                      !demoMode && jobs.length === 0 ? (
                        <DashboardEmptyState
                          title="No tasks yet"
                          description="Post a task describing what you need done — artisans in your area can send you quotes."
                          action={
                            <Link href="/post-job" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold"
                              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                              Post a task
                            </Link>
                          }
                        />
                      ) : undefined
                    }
                  />
                </motion.div>
              )}

              {tab === "bids" && (
                <motion.div key="bids" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>
                      Offers for Me <span className="font-mono text-[13px] ml-2" style={{ color: "#5A5A50" }}>({filteredBids.length})</span>
                    </h2>
                    <select
                      value={selectedJobFilter}
                      onChange={e => setSelectedJobFilter(e.target.value)}
                      className="h-9 rounded-xl px-3 font-sans text-[13px] outline-none appearance-none cursor-pointer"
                      style={{ backgroundColor: "#131310", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                    >
                      <option value="all">All my tasks</option>
                      {jobs.filter(j => j.bids > 0).map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-3">
                    {!demoMode && filteredBids.length === 0 ? (
                      <DashboardEmptyState
                        title="No offers yet"
                        description={jobs.length === 0
                          ? "Post a task first, then artisans can send you offers to review."
                          : "Artisans haven't bid on your open tasks yet. Check back soon or post another task."}
                        action={jobs.length === 0 ? (
                          <Link href="/post-job" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold"
                            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                            Post a task
                          </Link>
                        ) : undefined}
                      />
                    ) : filteredBids.map(bid => (
                      <BidCard key={bid.id} bid={bid} accepted={acceptedBids.includes(bid.id)} declined={declinedBids.includes(bid.id)}
                        onAccept={() => setAcceptedBids(p => [...p, bid.id])}
                        onDecline={() => setDeclinedBids(p => [...p, bid.id])}
                        showJobTitle
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "payments" && (
                <motion.div key="payments" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {/* Balance card */}
                  {(() => {
                    const escrow = payments.filter(p => p.status === "escrow");
                    const escrowTotal = escrow.reduce((s, p) => s + Number(p.amount.replace(/[^0-9]/g, "")), 0);
                    return (
                      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15) 0%, rgba(200,134,26,0.04) 100%)", border: "1px solid rgba(200,134,26,0.2)" }}>
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(200,134,26,0.1)", transform: "translate(30%, -30%)" }} />
                        <p className="font-mono text-[11px] uppercase tracking-widest mb-1" style={{ color: "var(--color-ochre)" }}>Escrow Balance</p>
                        <p className="font-serif mb-1" style={{ fontSize: "40px", color: "var(--color-cream)" }}>₦{escrowTotal.toLocaleString()}</p>
                        <p className="font-sans text-[13px]" style={{ color: "rgba(242,237,223,0.45)" }}>
                          {escrow.length > 0 ? `Held for — ${escrow[0].job}` : "No funds in escrow"}
                        </p>
                      </div>
                    );
                  })()}
                  <h2 className="font-sans text-[16px] font-semibold mb-4" style={{ color: "var(--color-cream)" }}>Payment History</h2>
                  <div className="flex flex-col gap-2">
                    {payments.length === 0 && !demoMode ? (
                      <DashboardEmptyState
                        title="No payments yet"
                        description="When you accept an offer and pay through FIXORA escrow, your payment history will show here."
                      />
                    ) : payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl px-5 py-4 transition-colors duration-200"
                        style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A25")}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E1A")}
                      >
                        <div>
                          <p className="font-sans text-[14px] font-medium mb-0.5" style={{ color: "var(--color-cream)" }}>{p.job}</p>
                          <p className="font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.4)" }}>{p.artisan} · {p.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[15px] font-semibold" style={{ color: "var(--color-cream)" }}>{p.amount}</p>
                          <span className="font-sans text-[11px] rounded-full px-2.5 py-0.5"
                            style={{ backgroundColor: p.status === "escrow" ? "rgba(59,130,246,0.1)" : "rgba(46,204,106,0.1)", color: p.status === "escrow" ? "#3B82F6" : "#2ECC6A" }}>
                            {p.status === "escrow" ? "In escrow" : "Released"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="max-w-lg">
                    <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-[24px]" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>{initials}</div>
                        <div>
                          <h2 className="font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>{profile?.fullName ?? "—"}</h2>
                          <p className="font-sans text-[13px]" style={{ color: "rgba(242,237,223,0.45)" }}>{profile?.state ? `${profile.state}, Nigeria` : "Nigeria"}</p>
                        </div>
                      </div>
                      {editingProfile ? (
                        <form onSubmit={saveProfile} className="space-y-4">
                          {[
                            { id: "customer-name", label: "Full name", key: "fullName", required: true },
                            { id: "customer-phone", label: "Phone", key: "phone", required: false },
                            { id: "customer-state", label: "State", key: "state", required: false },
                          ].map((field) => (
                            <label key={field.id} htmlFor={field.id} className="block">
                              <span className="mb-1.5 block font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.5)" }}>{field.label}</span>
                              <input
                                id={field.id}
                                required={field.required}
                                value={profileDraft[field.key as keyof typeof profileDraft]}
                                onChange={(event) => setProfileDraft((draft) => ({ ...draft, [field.key]: event.target.value }))}
                                className="h-11 w-full rounded-xl px-3 font-sans text-[14px] outline-none focus:ring-1"
                                style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                              />
                            </label>
                          ))}
                          <label className="block">
                            <span className="mb-1.5 block font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.5)" }}>Email</span>
                            <input disabled value={profile?.email ?? ""} className="h-11 w-full cursor-not-allowed rounded-xl px-3 font-sans text-[14px] opacity-60" style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }} />
                          </label>
                          {profileMessage && <p role="alert" className="font-sans text-[12px]" style={{ color: "#E84545" }}>{profileMessage}</p>}
                          <div className="flex gap-3 pt-1">
                            <button type="button" disabled={profileSaving} onClick={() => { setEditingProfile(false); setProfileMessage(""); }} className="h-10 flex-1 rounded-xl font-sans text-[14px] font-semibold" style={{ border: "1px solid #2A2A25", color: "var(--color-cream)" }}>Cancel</button>
                            <button type="submit" disabled={profileSaving} className="h-10 flex-1 rounded-xl font-sans text-[14px] font-semibold disabled:opacity-60" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>{profileSaving ? "Saving…" : "Save changes"}</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {[
                            { label: "Full name", value: profile?.fullName ?? "—" },
                            { label: "Email", value: profile?.email ?? "—" },
                            { label: "Phone", value: profile?.phone ?? "Not set" },
                            { label: "Location", value: profile?.state ?? "Not set" },
                          ].map(field => (
                            <div key={field.label} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "#1E1E1A" }}>
                              <span className="font-sans text-[13px]" style={{ color: "rgba(242,237,223,0.4)" }}>{field.label}</span>
                              <span className="font-sans text-[14px]" style={{ color: "var(--color-cream)" }}>{field.value}</span>
                            </div>
                          ))}
                          {profileMessage && <p role="status" className="mt-4 font-sans text-[12px]" style={{ color: "#2ECC6A" }}>{profileMessage}</p>}
                          <button type="button" onClick={startProfileEdit} disabled={demoMode} className="mt-5 w-full h-10 rounded-xl font-sans text-[14px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>
                            {demoMode ? "Editing disabled in preview" : "Edit Profile"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <MobileNav
        active={tab}
        onSelect={setTab}
        items={[
          { id: "overview", label: "Overview", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
          { id: "jobs", label: "My Tasks", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
          { id: "bids", label: "Offers", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: "payments", label: "Payments", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          { id: "profile", label: "Profile", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ]}
      />
    </div>
  );
}

function SidebarContent({
  tab,
  setTab,
  setSidebarOpen,
  profile,
  initials,
}: {
  tab: string;
  setTab: (t: string) => void;
  setSidebarOpen: (v: boolean) => void;
  profile: CustomerProfile | null;
  initials: string;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b flex-shrink-0" style={{ borderColor: "#1E1E1A" }}>
        <Link href="/" className="font-serif text-[20px]" style={{ color: "var(--color-ochre)" }}>FIXORA</Link>
        <span className="font-sans text-[10px] rounded-full px-2 py-0.5 font-semibold" style={{ backgroundColor: "rgba(200,134,26,0.12)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.2)" }}>
          Homeowner
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map(item => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 cursor-pointer relative"
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
              {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
                <span className="ml-auto text-[11px] font-mono rounded-full px-2 py-0.5 font-semibold"
                  style={{ backgroundColor: "rgba(200,134,26,0.15)", color: "var(--color-ochre)" }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
        <Link
          href="/messages"
          onClick={() => setSidebarOpen(false)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200"
          style={{ color: "#5A5A50", border: "1px solid transparent" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#5A5A50"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="font-sans text-[14px] font-medium">Messages</span>
        </Link>
      </nav>

      {/* User card */}
      <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "#1E1E1A" }}>
        <Link href="/" className="flex items-center gap-2 text-center justify-center mb-3 font-sans text-[12px] transition-colors duration-200" style={{ color: "#5A5A50" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#7A7A6A")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#5A5A50")}
        >
          ← Back to marketplace
        </Link>
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: "#131310", border: "1px solid #1E1E1A" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-sans text-[12px] font-semibold flex-shrink-0" style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}>{initials}</div>
          <div className="min-w-0">
            <p className="font-sans text-[13px] font-medium truncate" style={{ color: "var(--color-cream)" }}>{profile?.fullName ?? "Customer"}</p>
            <p className="font-sans text-[11px] truncate" style={{ color: "rgba(242,237,223,0.35)" }}>{profile?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function JobTable({ jobs, emptyState }: { jobs: typeof JOBS; emptyState?: ReactNode }) {
  if (jobs.length === 0 && emptyState) return <>{emptyState}</>;
  return (
    <div className="flex flex-col gap-2">
      {jobs.map((job, i) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A25"; (e.currentTarget as HTMLDivElement).style.backgroundColor = "#141412"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1E1E1A"; (e.currentTarget as HTMLDivElement).style.backgroundColor = "#111110"; }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-sans text-[14px] font-semibold truncate" style={{ color: "var(--color-cream)" }}>{job.title}</p>
                {job.photos > 0 && (
                  <span className="flex-shrink-0 flex items-center gap-1 font-mono text-[10px]" style={{ color: "rgba(242,237,223,0.35)" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {job.photos}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.5)" }}>{job.category}</span>
                <span style={{ color: "rgba(242,237,223,0.15)" }}>·</span>
                <span className="font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.5)" }}>{job.location}</span>
                <span style={{ color: "rgba(242,237,223,0.15)" }}>·</span>
                <span className="font-sans text-[12px]" style={{ color: "rgba(242,237,223,0.35)" }}>{job.posted}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge status={job.status} />
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--color-cream)" }}>{job.budget}</span>
                {job.bids > 0 && (
                  <span className="font-sans text-[12px] rounded-full px-2.5 py-0.5" style={{ backgroundColor: "rgba(200,134,26,0.1)", color: "var(--color-ochre)" }}>
                    {job.bids} offer{job.bids !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BidCard({ bid, accepted, declined, onAccept, onDecline, showJobTitle = false }: {
  bid: typeof BIDS[0];
  accepted: boolean;
  declined: boolean;
  onAccept: () => void;
  onDecline: () => void;
  showJobTitle?: boolean;
}) {
  const showCover = showJobTitle && bid.coverImage;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: accepted
          ? "linear-gradient(135deg, rgba(46,204,106,0.06), rgba(46,204,106,0.02))"
          : declined
          ? "rgba(232,69,69,0.04)"
          : "#111110",
        border: `1px solid ${accepted ? "rgba(46,204,106,0.2)" : declined ? "rgba(232,69,69,0.15)" : "#1E1E1A"}`,
        opacity: declined ? 0.6 : 1,
      }}
    >
      {showCover && (
        <div className="relative h-36 w-full">
          <Image
            src={bid.coverImage!}
            alt={bid.jobTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(17,17,16,0.95) 0%, rgba(17,17,16,0.2) 55%, rgba(17,17,16,0.35) 100%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(200,134,26,0.9)" }}>
              Offer for
            </p>
            <p className="font-sans text-[14px] font-semibold leading-snug" style={{ color: "var(--color-cream)" }}>
              {bid.jobTitle}
            </p>
          </div>
        </div>
      )}
      <div className="p-5">
      {showJobTitle && !showCover && (
        <p className="font-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(242,237,223,0.35)" }}>
          Offer for: {bid.jobTitle}
        </p>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-sans text-[13px] font-semibold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.2), rgba(200,134,26,0.08))", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.15)" }}>
          {bid.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>{bid.artisan}</p>
            {bid.verified && (
              <span title="Verified artisan">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "#3B82F6" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Stars rating={bid.rating} />
            <span className="font-sans text-[11px]" style={{ color: "rgba(242,237,223,0.35)" }}>({bid.reviews} reviews)</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[17px] font-semibold" style={{ color: "var(--color-ochre)" }}>{bid.price}</p>
          <p className="font-sans text-[11px]" style={{ color: "rgba(242,237,223,0.35)" }}>{bid.submitted}</p>
        </div>
      </div>
      <p className="font-sans text-[13px] leading-relaxed mb-4" style={{ color: "rgba(242,237,223,0.6)" }}>
        "{bid.message}"
      </p>
      {!accepted && !declined ? (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onAccept}
            className="flex-1 h-9 rounded-xl font-sans text-[13px] font-semibold transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
          >
            Accept & Hire
          </motion.button>
          <button
            onClick={onDecline}
            className="h-9 px-4 rounded-xl font-sans text-[13px] transition-all duration-200"
            style={{ backgroundColor: "transparent", border: "1px solid rgba(242,237,223,0.12)", color: "rgba(242,237,223,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,69,69,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#E84545"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A25"; (e.currentTarget as HTMLButtonElement).style.color = "#5A5A50"; }}
          >
            Decline
          </button>
        </div>
      ) : accepted ? (
        <div className="flex items-center gap-2 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold" style={{ background: "rgba(46,204,106,0.1)", color: "#2ECC6A", border: "1px solid rgba(46,204,106,0.2)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2 7 5.5 10.5 12 3.5"/></svg>
          Hired — payment held in escrow
        </div>
      ) : (
        <div className="h-9 px-4 flex items-center rounded-xl font-sans text-[13px]" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545" }}>
          Offer declined
        </div>
      )}
      </div>
    </motion.div>
  );
}
