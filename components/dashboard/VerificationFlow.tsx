"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategorySelect from "@/components/CategorySelect";
import { submitArtisanVerification } from "@/lib/supabase/verification";

type Step = "intro" | "nin" | "face" | "profile" | "done";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

interface ProfileData {
  trade: string;
  years: string;
  bio: string;
  serviceStates: string[];
  dailyRate: string;
  languages: string[];
}

interface Props {
  onComplete: () => void;
  onClose: () => void;
}

export default function VerificationFlow({ onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [nin, setNin] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [scanCountdown, setScanCountdown] = useState(3);
  const [profile, setProfile] = useState<ProfileData>({
    trade: "",
    years: "",
    bio: "",
    serviceStates: [],
    dailyRate: "",
    languages: [],
  });
  const [camError, setCamError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function startCamera() {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamError("Camera access denied. Please allow camera access and try again.");
    }
  }

  useEffect(() => {
    if (step === "face") startCamera();
    else stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function captureFacePhoto(): Promise<File | null> {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return Promise.resolve(null);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        resolve(new File([blob], "face.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.85);
    });
  }

  function beginScan() {
    setScanState("scanning");
    setScanCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setScanCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        captureFacePhoto().then((file) => {
          if (file) setFaceFile(file);
          setScanState("done");
        });
      }
    }, 1000);
  }

  async function handleSubmit() {
    if (!idFile) return;
    setSubmitting(true);
    setSubmitError("");
    const { error } = await submitArtisanVerification(nin, idFile, faceFile, profile);
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setStep("done");
  }

  const ninValid = /^\d{11}$/.test(nin);
  const profileValid = profile.trade && profile.years && profile.bio.length >= 30 && profile.serviceStates.length > 0;

  function toggleState(s: string) {
    setProfile(p => ({
      ...p,
      serviceStates: p.serviceStates.includes(s)
        ? p.serviceStates.filter(x => x !== s)
        : [...p.serviceStates, s],
    }));
  }

  function toggleLanguage(l: string) {
    setProfile(p => ({
      ...p,
      languages: p.languages.includes(l)
        ? p.languages.filter(x => x !== l)
        : [...p.languages, l],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F0E0C", border: "1px solid #2A2A25", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1E1A" }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--color-ochre)" }}>
              Artisan Verification
            </p>
            <StepIndicator step={step} />
          </div>
          {step !== "done" && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: "#5A5A50" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-cream)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/>
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 70px)" }}>
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <StepPanel key="intro">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "linear-gradient(135deg, rgba(200,134,26,0.2), rgba(200,134,26,0.05))", border: "1px solid rgba(200,134,26,0.25)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ochre)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h2 className="font-serif text-[24px] mb-3" style={{ color: "var(--color-cream)" }}>Verify to Go Live</h2>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: "#5A5A50" }}>
                    To start bidding on jobs and getting hired on Fixora, we need to confirm your identity and set up your public profile. This takes about 3 minutes.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  {[
                    { icon: "🪪", title: "NIN Verification", desc: "Your National Identification Number + a photo of your ID" },
                    { icon: "📷", title: "Selfie Photo", desc: "A live selfie our team compares with your ID during review" },
                    { icon: "📋", title: "Profile Setup", desc: "Tell customers about your trade, experience and service area" },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-4 rounded-xl p-4" style={{ backgroundColor: "#131310", border: "1px solid #1E1E1A" }}>
                      <span className="text-[22px] flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <p className="font-sans text-[14px] font-semibold mb-0.5" style={{ color: "var(--color-cream)" }}>{item.title}</p>
                        <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <PrimaryButton onClick={() => setStep("nin")}>Start Verification</PrimaryButton>
              </StepPanel>
            )}

            {step === "nin" && (
              <StepPanel key="nin">
                <h2 className="font-serif text-[22px] mb-1" style={{ color: "var(--color-cream)" }}>NIN Verification</h2>
                <p className="font-sans text-[13px] mb-6" style={{ color: "#5A5A50" }}>
                  Enter your 11-digit National Identification Number and upload a clear photo of your ID (NIN slip, voter's card, international passport, or driver's licence).
                </p>

                <div className="mb-5">
                  <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    NIN Number
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={nin}
                    onChange={e => setNin(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678901"
                    className="w-full h-12 rounded-xl px-4 font-mono text-[16px] tracking-widest outline-none"
                    style={{ backgroundColor: "#0D0D0B", border: `1px solid ${ninValid ? "rgba(46,204,106,0.4)" : "#2A2A25"}`, color: "var(--color-cream)" }}
                    onFocus={e => { if (!ninValid) e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)"; }}
                    onBlur={e => { if (!ninValid) e.currentTarget.style.borderColor = "#2A2A25"; }}
                  />
                  <p className="font-sans text-[11px] mt-1.5" style={{ color: nin.length > 0 && !ninValid ? "#E84545" : "#5A5A50" }}>
                    {nin.length}/11 digits {ninValid && "✓"}
                  </p>
                </div>

                <div className="mb-7">
                  <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
                    Government ID Photo
                  </label>
                  <label
                    className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: "#0D0D0B",
                      border: `2px dashed ${idFile ? "rgba(46,204,106,0.4)" : "#2A2A25"}`,
                      padding: "28px 16px",
                    }}
                    onMouseEnter={e => { if (!idFile) (e.currentTarget as HTMLLabelElement).style.borderColor = "rgba(200,134,26,0.35)"; }}
                    onMouseLeave={e => { if (!idFile) (e.currentTarget as HTMLLabelElement).style.borderColor = "#2A2A25"; }}
                  >
                    <input type="file" accept="image/*" className="hidden" onChange={e => setIdFile(e.target.files?.[0] ?? null)} />
                    {idFile ? (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ECC6A" strokeWidth="1.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <p className="font-sans text-[13px] mt-2 font-medium" style={{ color: "#2ECC6A" }}>{idFile.name}</p>
                        <p className="font-sans text-[11px] mt-0.5" style={{ color: "#5A5A50" }}>Tap to change</p>
                      </>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5A5A50" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p className="font-sans text-[13px] mt-2.5 font-medium" style={{ color: "var(--color-cream)" }}>Upload ID photo</p>
                        <p className="font-sans text-[11px] mt-0.5" style={{ color: "#5A5A50" }}>JPG, PNG — max 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                <PrimaryButton onClick={() => setStep("face")} disabled={!ninValid || !idFile}>
                  Continue to Face Scan
                </PrimaryButton>
              </StepPanel>
            )}

            {step === "face" && (
              <StepPanel key="face">
                <h2 className="font-serif text-[22px] mb-1" style={{ color: "var(--color-cream)" }}>Selfie Photo</h2>
                <p className="font-sans text-[13px] mb-5" style={{ color: "#5A5A50" }}>
                  Position your face in the frame and stay still. An admin will compare this photo with your ID document by hand.
                </p>

                <div className="relative rounded-2xl overflow-hidden mb-5" style={{ aspectRatio: "4/3", backgroundColor: "#0D0D0B", border: "1px solid #2A2A25" }}>
                  {camError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E84545" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p className="font-sans text-[13px]" style={{ color: "#E84545" }}>{camError}</p>
                      <button onClick={startCamera} className="font-sans text-[12px] underline underline-offset-2" style={{ color: "var(--color-ochre)" }}>Try again</button>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />

                      {/* Oval face guide */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="rounded-full" style={{
                          width: "52%", aspectRatio: "3/4",
                          border: `2px solid ${scanState === "done" ? "#2ECC6A" : scanState === "scanning" ? "var(--color-ochre)" : "rgba(255,255,255,0.35)"}`,
                          boxShadow: scanState === "done" ? "0 0 24px rgba(46,204,106,0.3)" : scanState === "scanning" ? "0 0 24px rgba(200,134,26,0.3)" : "none",
                          transition: "border-color 0.3s, box-shadow 0.3s",
                        }} />
                      </div>

                      {/* Scan overlay */}
                      {scanState === "scanning" && (
                        <motion.div
                          className="absolute inset-x-0 pointer-events-none"
                          style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--color-ochre), transparent)", top: "15%" }}
                          animate={{ top: ["15%", "85%", "15%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}

                      {/* Countdown */}
                      {scanState === "scanning" && scanCountdown > 0 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                          <motion.div
                            key={scanCountdown}
                            initial={{ scale: 1.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-[18px] font-bold"
                            style={{ backgroundColor: "rgba(200,134,26,0.2)", border: "1px solid rgba(200,134,26,0.4)", color: "var(--color-ochre)" }}
                          >
                            {scanCountdown}
                          </motion.div>
                        </div>
                      )}

                      {/* Done checkmark */}
                      {scanState === "done" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgba(46,204,106,0.15)", border: "2px solid #2ECC6A" }}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC6A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </motion.div>
                          <p className="font-sans text-[14px] font-semibold" style={{ color: "#2ECC6A" }}>Photo captured</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {scanState === "idle" && !camError && (
                  <PrimaryButton onClick={beginScan}>Begin Scan</PrimaryButton>
                )}
                {scanState === "scanning" && (
                  <div className="h-11 flex items-center justify-center rounded-xl font-sans text-[14px] font-semibold"
                    style={{ backgroundColor: "rgba(200,134,26,0.08)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.2)" }}>
                    Scanning… hold still
                  </div>
                )}
                {scanState === "done" && (
                  <PrimaryButton onClick={() => setStep("profile")}>Continue to Profile Setup</PrimaryButton>
                )}
              </StepPanel>
            )}

            {step === "profile" && (
              <StepPanel key="profile">
                <h2 className="font-serif text-[22px] mb-1" style={{ color: "var(--color-cream)" }}>Set Up Your Profile</h2>
                <p className="font-sans text-[13px] mb-6" style={{ color: "#5A5A50" }}>
                  This is what customers see when they're deciding who to hire. Take a moment to fill it out properly.
                </p>

                {/* Trade */}
                <Field label="Your Primary Trade">
                  <CategorySelect
                    value={profile.trade}
                    onChange={(trade) => setProfile(p => ({ ...p, trade }))}
                    placeholder="Select your trade"
                    className="w-full h-11 rounded-xl px-4 font-sans text-[14px] outline-none appearance-none cursor-pointer"
                    style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: profile.trade ? "var(--color-cream)" : "#5A5A50" }}
                  />
                </Field>

                {/* Years */}
                <Field label="Years of Experience">
                  <select
                    value={profile.years}
                    onChange={e => setProfile(p => ({ ...p, years: e.target.value }))}
                    className="w-full h-11 rounded-xl px-4 font-sans text-[14px] outline-none appearance-none cursor-pointer"
                    style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: profile.years ? "var(--color-cream)" : "#5A5A50" }}
                  >
                    <option value="" disabled>Select experience</option>
                    {["Less than 1 year","1–2 years","3–5 years","6–10 years","10+ years"].map(y => (
                      <option key={y} value={y} style={{ color: "#fff", backgroundColor: "#141412" }}>{y}</option>
                    ))}
                  </select>
                </Field>

                {/* Bio */}
                <Field label={`About You (${profile.bio.length}/300)`}>
                  <textarea
                    rows={4}
                    maxLength={300}
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe your skills, work style, and what sets you apart. Customers read this before choosing who to hire."
                    className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
                    style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                  />
                  {profile.bio.length > 0 && profile.bio.length < 30 && (
                    <p className="font-sans text-[11px] mt-1" style={{ color: "#E84545" }}>Add a bit more — at least 30 characters</p>
                  )}
                </Field>

                {/* Daily rate */}
                <Field label="Daily Rate (₦) — optional">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: "var(--color-ochre)" }}>₦</span>
                    <input
                      type="number"
                      value={profile.dailyRate}
                      onChange={e => setProfile(p => ({ ...p, dailyRate: e.target.value }))}
                      placeholder="e.g. 15000"
                      className="w-full h-11 rounded-xl pl-9 pr-4 font-sans text-[14px] outline-none"
                      style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(200,134,26,0.5)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#2A2A25")}
                    />
                  </div>
                </Field>

                {/* Service states */}
                <Field label={`States You Serve (${profile.serviceStates.length} selected)`}>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {NIGERIAN_STATES.map(s => {
                      const active = profile.serviceStates.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleState(s)}
                          className="h-7 px-3 rounded-full font-sans text-[11px] font-medium transition-all duration-150"
                          style={{
                            backgroundColor: active ? "rgba(200,134,26,0.15)" : "#0D0D0B",
                            border: `1px solid ${active ? "rgba(200,134,26,0.4)" : "#2A2A25"}`,
                            color: active ? "var(--color-ochre)" : "#5A5A50",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Languages */}
                <Field label="Languages Spoken">
                  <div className="flex flex-wrap gap-2">
                    {["English","Yoruba","Igbo","Hausa","Pidgin"].map(l => {
                      const active = profile.languages.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => toggleLanguage(l)}
                          className="h-8 px-4 rounded-full font-sans text-[12px] font-medium transition-all duration-150"
                          style={{
                            backgroundColor: active ? "rgba(200,134,26,0.15)" : "#0D0D0B",
                            border: `1px solid ${active ? "rgba(200,134,26,0.4)" : "#2A2A25"}`,
                            color: active ? "var(--color-ochre)" : "#5A5A50",
                          }}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {submitError && (
                  <p className="font-sans text-[13px] mb-4 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>
                    {submitError}
                  </p>
                )}

                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={!profileValid || submitting}
                >
                  {submitting ? "Submitting…" : "Submit for Review"}
                </PrimaryButton>
              </StepPanel>
            )}

            {step === "done" && (
              <StepPanel key="done">
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "linear-gradient(135deg, rgba(46,204,106,0.2), rgba(46,204,106,0.05))", border: "2px solid rgba(46,204,106,0.35)" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ECC6A" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </motion.div>

                  <h2 className="font-serif text-[26px] mb-3" style={{ color: "var(--color-cream)" }}>You're all set!</h2>
                  <p className="font-sans text-[14px] leading-relaxed mb-2" style={{ color: "#5A5A50" }}>
                    Your documents have been submitted. Our team will manually review your NIN and photos — usually within <strong style={{ color: "var(--color-cream)" }}>24–48 hours</strong>.
                  </p>
                  <p className="font-sans text-[13px] leading-relaxed mb-8" style={{ color: "#3A3A30" }}>
                    You'll be notified once an admin approves your application and you can start bidding on jobs.
                  </p>

                  <div className="rounded-xl p-4 mb-8 text-left" style={{ backgroundColor: "#131310", border: "1px solid #1E1E1A" }}>
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#5A5A50" }}>What happens next</p>
                    {[
                      "An admin reviews your NIN number and government ID photo",
                      "They compare your selfie with your ID document by hand",
                      "Once approved, your profile goes live and you can start getting hired",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold mt-0.5"
                          style={{ backgroundColor: "rgba(200,134,26,0.15)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.2)" }}>
                          {i + 1}
                        </span>
                        <p className="font-sans text-[13px]" style={{ color: "#7A7A6A" }}>{item}</p>
                      </div>
                    ))}
                  </div>

                  <PrimaryButton onClick={onComplete}>Back to Dashboard</PrimaryButton>
                </div>
              </StepPanel>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["intro", "nin", "face", "profile", "done"];
  const labels = ["Intro", "NIN", "Face", "Profile", "Done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.slice(1).map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < idx
                ? "#2ECC6A"
                : i === idx - 1
                ? "var(--color-ochre)"
                : "#2A2A25",
            }}
          />
          {i < steps.length - 2 && <div className="w-4 h-px" style={{ backgroundColor: "#2A2A25" }} />}
        </div>
      ))}
      <span className="ml-1 font-sans text-[12px]" style={{ color: "#5A5A50" }}>
        {idx > 0 ? `Step ${idx} of 4` : "Overview"}
      </span>
      <span className="hidden font-sans text-[11px]">{labels[idx]}</span>
    </div>
  );
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="px-6 py-6"
    >
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-xl font-sans text-[14px] font-semibold transition-all duration-200"
      style={{
        background: disabled ? "#1E1E1A" : "linear-gradient(135deg, #C8861A, #E8A040)",
        color: disabled ? "#3A3A30" : "#0D0D0B",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(200,134,26,0.25)",
      }}
    >
      {children}
    </motion.button>
  );
}
