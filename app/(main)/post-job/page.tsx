"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitJob } from "@/lib/supabase/jobs";
import { createClient } from "@/lib/supabase/client";
import { getTradeLabel } from "@/lib/categories";
import CategoryIconPicker from "@/components/CategoryIconPicker";

const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const TIMELINES = [
  { value: "urgent", label: "Urgent", sub: "Within 24 hours" },
  { value: "week", label: "This week", sub: "Within 7 days" },
  { value: "flexible", label: "Flexible", sub: "No rush" },
];

interface FormData {
  title: string;
  category: string;
  state: string;
  lga: string;
  description: string;
  timeline: string;
  photoPreviews: string[];
  photoFiles: File[];
  budgetType: "fixed" | "open";
  amount: string;
  phone: string;
}

const STEP_LABELS = ["Details", "Photos", "Budget"];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex flex-col items-center mb-12">
    {/* Circles + connectors row */}
    <div className="flex items-center">
      {STEP_LABELS.map((_, i) => {
        const n = i + 1;
        return (
          <div key={n} className="flex items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-[13px] font-semibold transition-all duration-500"
              style={{
                background: n <= current ? "linear-gradient(135deg, #C8861A, #E8A040)" : "rgba(42,42,37,1)",
                color: n <= current ? "#0D0D0B" : "#5A5A50",
                boxShadow: n === current ? "0 0 20px rgba(200,134,26,0.4)" : "none",
              }}
            >
              {n < current ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 7 5.5 10.5 12 3.5" />
                </svg>
              ) : n}
            </div>
            {i < 2 && (
              <div className="w-20 mx-1.5 h-px relative overflow-hidden" style={{ backgroundColor: "#2A2A25" }}>
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{ background: "linear-gradient(90deg, #C8861A, #E8A040)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: n < current ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
    {/* Labels row — mirrors the circles row exactly */}
    <div className="flex items-center mt-2.5">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        return (
          <div key={label} className="flex items-center">
            <span
              className="w-9 text-center font-sans text-[10px] tracking-wider uppercase"
              style={{ color: n <= current ? "var(--color-ochre)" : "#3A3A33" }}
            >
              {label}
            </span>
            {i < 2 && <div className="w-20 mx-1.5" />}
          </div>
        );
      })}
    </div>
  </div>
);

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    state: "",
    lga: "",
    description: "",
    timeline: "",
    photoPreviews: [],
    photoFiles: [],
    budgetType: "open",
    amount: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (k: keyof FormData, v: string | string[] | File[]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addPhotos = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    Array.from(files).slice(0, 8 - form.photoPreviews.length).forEach((f) => {
      if (f.type.startsWith("image/")) {
        newFiles.push(f);
        newPreviews.push(URL.createObjectURL(f));
      }
    });
    setForm(prev => ({
      ...prev,
      photoFiles: [...prev.photoFiles, ...newFiles],
      photoPreviews: [...prev.photoPreviews, ...newPreviews],
    }));
  }, [form.photoPreviews.length]);

  const removePhoto = (i: number) =>
    setForm(prev => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, idx) => idx !== i),
      photoPreviews: prev.photoPreviews.filter((_, idx) => idx !== i),
    }));

  const canNext = (): boolean => {
    if (step === 1) return !!(form.title.trim() && form.category && form.state);
    if (step === 2) return true;
    if (step === 3) return true;
    return false;
  };

  const next = async () => {
    if (!canNext()) return;
    if (step < 3) { setStep(step + 1); return; }
    setSubmitting(true);
    setSubmitError("");
    const categoryLabel = getTradeLabel(form.category);
    const { error } = await submitJob({
      title:         form.title,
      category:      categoryLabel,
      state:         form.state,
      lga:           form.lga,
      description:   form.description,
      timeline:      form.timeline,
      amount:        form.amount,
      photoPreviews: form.photoPreviews,
      photoFiles:    form.photoFiles,
    });
    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#0D0D0B" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(200,134,26,0.14) 0%, transparent 70%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(200,134,26,0.06) 0%, transparent 70%)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", boxShadow: "0 0 60px rgba(200,134,26,0.4)" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#0D0D0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 18 13 25 30 10" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="font-serif mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--color-cream)" }}
          >
            Your task is live!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="font-sans text-[16px] mb-2"
            style={{ color: "#7A7A6A" }}
          >
            {form.category && getTradeLabel(form.category)} artisans near {form.state || "you"} are already reviewing your request.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-10"
            style={{ color: "var(--color-ochre)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-ochre)" }} />
            <span className="font-mono text-[13px]">Matching artisans now...</span>
          </motion.div>

          {isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="rounded-2xl p-8"
              style={{
                background: "linear-gradient(135deg, rgba(200,134,26,0.12) 0%, rgba(200,134,26,0.04) 100%)",
                border: "1px solid rgba(200,134,26,0.25)",
              }}
            >
              <p className="font-sans text-[14px] mb-6" style={{ color: "#7A7A6A" }}>
                Track offers as they come in, chat with artisans, compare proposals, and confirm your hire — all in your dashboard.
              </p>
              <button
                onClick={() => router.push("/customer")}
                className="block w-full text-center rounded-xl py-3.5 font-sans text-[15px] font-semibold transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "none")}
              >
                View in My Dashboard →
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="rounded-2xl p-8 mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(200,134,26,0.12) 0%, rgba(200,134,26,0.04) 100%)",
                  border: "1px solid rgba(200,134,26,0.25)",
                }}
              >
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ backgroundColor: "rgba(200,134,26,0.12)", border: "1px solid rgba(200,134,26,0.2)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16z"/>
                  </svg>
                  <span className="font-sans text-[12px] font-semibold" style={{ color: "var(--color-ochre)" }}>Track your offers in real time</span>
                </div>
                <h2 className="font-serif mb-2" style={{ fontSize: "22px", color: "var(--color-cream)" }}>
                  Create a free account to get notified
                </h2>
                <p className="font-sans text-[14px] mb-6" style={{ color: "#7A7A6A" }}>
                  See offers as they come in, message artisans directly, compare proposals, and pay securely through escrow.
                </p>
                <Link
                  href="/signup"
                  className="block w-full text-center rounded-xl py-3.5 font-sans text-[15px] font-semibold transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                >
                  Create Free Account — It takes 30 seconds
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.4 }}
                className="rounded-2xl p-5"
                style={{ backgroundColor: "#131310", border: "1px solid #2A2A25" }}
              >
                <p className="font-sans text-[13px] mb-3" style={{ color: "#5A5A50" }}>
                  Continue as guest — we'll text you when offers arrive
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="flex-1 h-10 rounded-lg px-3 font-sans text-[14px] outline-none"
                    style={{ backgroundColor: "#1B1B17", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                  />
                  <button
                    className="h-10 px-4 rounded-lg font-sans text-[13px] font-semibold transition-colors duration-200"
                    style={{ backgroundColor: "#2A2A25", color: "var(--color-cream)" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3A3A33")}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2A2A25")}
                  >
                    Notify me
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#0D0D0B" }}>
      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(200,134,26,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 30% at 80% 90%, rgba(200,134,26,0.05) 0%, transparent 60%)" }} />
      </div>

      {/* Single centred container — top bar + all content share one axis */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="font-serif text-[20px]" style={{ color: "var(--color-ochre)" }}>
            FIXORA
          </Link>
          <Link href="/" className="font-sans text-[13px] transition-colors duration-200" style={{ color: "#5A5A50" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#5A5A50")}
          >
            ← Back to home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mt-10 mb-10">
          <h1 className="font-serif mb-2" style={{ fontSize: "clamp(30px, 4vw, 48px)", color: "var(--color-cream)" }}>
            Post a Task
          </h1>
          <p className="font-sans text-[15px]" style={{ color: "#5A5A50" }}>
            Describe what you need — artisans near you will send offers
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl p-6 sm:p-8 mb-5" style={{ backgroundColor: "#111110", border: "1px solid #222220" }}>
                <h2 className="font-sans text-[18px] font-semibold mb-6" style={{ color: "var(--color-cream)" }}>
                  Describe the task
                </h2>

                {/* Title */}
                <div className="mb-5">
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    Task title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    placeholder="e.g. Fix leaking kitchen pipe, Repaint bedroom walls"
                    className="w-full h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "#0D0D0B",
                      border: "1px solid #2A2A25",
                      color: "var(--color-cream)",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                  />
                </div>

                {/* Category */}
                <div className="mb-5">
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#5A5A50" }}>
                    Category
                  </label>
                  <CategoryIconPicker
                    value={form.category}
                    onChange={(tradeId) => set("category", tradeId)}
                  />
                </div>

                {/* State + LGA */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>State</label>
                    <select
                      value={form.state}
                      onChange={e => set("state", e.target.value)}
                      className="w-full h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all duration-200 appearance-none cursor-pointer"
                      style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: form.state ? "var(--color-cream)" : "#5A5A50" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                    >
                      <option value="" disabled>Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>Area / LGA</label>
                    <input
                      type="text"
                      value={form.lga}
                      onChange={e => set("lga", e.target.value)}
                      placeholder="e.g. Ikeja, Lekki"
                      className="w-full h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all duration-200"
                      style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    Describe the problem or task
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Include as much detail as possible — size of the job, current condition, any special requirements..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 font-sans text-[15px] outline-none transition-all duration-200 resize-none"
                    style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                  />
                  <p className="mt-1.5 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
                    More detail = more accurate quotes
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#5A5A50" }}>
                    When do you need this done?
                  </label>
                  <div className="flex gap-2">
                    {TIMELINES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set("timeline", t.value)}
                        className="flex-1 rounded-xl py-3 transition-all duration-200 cursor-pointer"
                        style={{
                          backgroundColor: form.timeline === t.value ? "rgba(200,134,26,0.1)" : "#0D0D0B",
                          border: `1px solid ${form.timeline === t.value ? "rgba(200,134,26,0.45)" : "#2A2A25"}`,
                        }}
                      >
                        <div className="font-sans text-[13px] font-semibold" style={{ color: form.timeline === t.value ? "var(--color-ochre)" : "var(--color-cream)" }}>
                          {t.label}
                        </div>
                        <div className="font-sans text-[11px]" style={{ color: "#5A5A50" }}>{t.sub}</div>
                        {t.value === "urgent" && (
                          <div className="font-sans text-[10px] mt-0.5" style={{ color: "#E84545" }}>
                            Extra fees may apply
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl p-6 sm:p-8 mb-5" style={{ backgroundColor: "#111110", border: "1px solid #222220" }}>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>
                    Add photos
                  </h2>
                  <span className="font-mono text-[12px] rounded-full px-3 py-1" style={{ backgroundColor: "#1B1B17", color: "#5A5A50" }}>
                    {form.photoPreviews.length}/8
                  </span>
                </div>
                <p className="font-sans text-[14px] mb-6" style={{ color: "#5A5A50" }}>
                  Photos help artisans understand the scope of work and give more accurate quotes. This step is optional.
                </p>

                {/* Drop zone */}
                <div
                  className="rounded-2xl transition-all duration-300 cursor-pointer"
                  style={{
                    border: `2px dashed ${isDragging ? "rgba(200,134,26,0.7)" : "rgba(200,134,26,0.2)"}`,
                    backgroundColor: isDragging ? "rgba(200,134,26,0.05)" : "transparent",
                    padding: form.photoPreviews.length ? "16px" : "48px 24px",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); addPhotos(e.dataTransfer.files); }}
                >
                  {form.photoPreviews.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.15), rgba(200,134,26,0.05))", border: "1px solid rgba(200,134,26,0.2)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-[15px] font-semibold mb-1" style={{ color: "var(--color-cream)" }}>
                          Drag photos here, or click to browse
                        </p>
                        <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>
                          JPG, PNG or HEIC — up to 8 photos, 10MB each
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {form.photoPreviews.map((src, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removePhoto(i); }}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "rgba(232,69,69,0.8)" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      {form.photoPreviews.length < 8 && (
                        <div
                          className="aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
                          style={{ border: "2px dashed rgba(200,134,26,0.25)", backgroundColor: "rgba(200,134,26,0.03)" }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(200,134,26,0.5)" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addPhotos(e.target.files)}
                />

                {/* Tips */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["Show the full area", "Close-up of damage", "Good lighting"].map(tip => (
                    <div key={tip} className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25" }}>
                      <p className="font-sans text-[11px]" style={{ color: "#5A5A50" }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl p-6 sm:p-8 mb-5" style={{ backgroundColor: "#111110", border: "1px solid #222220" }}>
                <h2 className="font-sans text-[18px] font-semibold mb-2" style={{ color: "var(--color-cream)" }}>
                  Your budget
                </h2>
                <p className="font-sans text-[14px] mb-6" style={{ color: "#5A5A50" }}>
                  Enter an amount you have in mind, or leave it blank and let artisans propose their price.
                </p>

                {/* Single price input */}
                <div className="mb-6">
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-semibold text-[16px]" style={{ color: "var(--color-ochre)" }}>₦</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => set("amount", e.target.value)}
                      placeholder="Leave blank — open to quotes"
                      className="w-full h-14 rounded-xl pl-9 pr-4 font-sans text-[15px] outline-none transition-all duration-200"
                      style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                    />
                  </div>
                  <p className="mt-2 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
                    {form.amount.trim()
                      ? "Artisans can accept this price or negotiate"
                      : "Leaving it blank invites competitive quotes from artisans"}
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    Phone number (to receive updates)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full h-12 rounded-xl px-4 font-sans text-[15px] outline-none transition-all duration-200"
                    style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                  />
                  <p className="mt-1.5 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
                    Optional — we'll SMS you when artisans respond
                  </p>
                </div>
              </div>

              {/* Summary card */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.06), rgba(200,134,26,0.02))", border: "1px solid rgba(200,134,26,0.15)" }}>
                <p className="font-sans text-[12px] uppercase tracking-wider mb-3" style={{ color: "#5A5A50" }}>Task summary</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "Task", value: form.title || "—" },
                    { label: "Category", value: form.category ? getTradeLabel(form.category) : "—" },
                    { label: "Location", value: [form.lga, form.state].filter(Boolean).join(", ") || "—" },
                    { label: "Photos", value: `${form.photoPreviews.length} attached` },
                    { label: "Budget", value: form.amount.trim() ? `₦${Number(form.amount).toLocaleString()}` : "Open to quotes" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>{row.label}</span>
                      <span className="font-sans text-[13px] font-medium" style={{ color: "var(--color-cream)" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 h-12 px-6 rounded-xl font-sans text-[14px] font-medium transition-all duration-200"
              style={{ backgroundColor: "#131310", border: "1px solid #2A2A25", color: "#5A5A50" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3A3A33"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-cream)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A25"; (e.currentTarget as HTMLButtonElement).style.color = "#5A5A50"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4l-4 4 4 4" />
              </svg>
              Back
            </button>
          ) : <div />}

          {submitError && (
            <p className="font-sans text-[13px] rounded-xl px-4 py-2" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.15)" }}>
              {submitError}
            </p>
          )}
          <motion.button
            type="button"
            onClick={next}
            disabled={submitting}
            whileHover={canNext() && !submitting ? { scale: 1.02 } : {}}
            whileTap={canNext() && !submitting ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 h-12 px-8 rounded-xl font-sans text-[15px] font-semibold transition-all duration-200"
            style={{
              background: canNext() ? "linear-gradient(135deg, #C8861A, #E8A040)" : "#1B1B17",
              color: canNext() ? "#0D0D0B" : "#3A3A33",
              cursor: canNext() && !submitting ? "pointer" : "not-allowed",
              boxShadow: canNext() ? "0 4px 20px rgba(200,134,26,0.3)" : "none",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Posting…" : step === 3 ? "Post Task" : "Continue"}
            {!submitting && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
