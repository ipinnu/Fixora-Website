"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitProofOfWork } from "@/lib/supabase/completions";

interface Props {
  jobId: string;
  bidId: string;
  jobTitle: string;
  demoMode?: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ProofOfWorkModal({ jobId, bidId, jobTitle, demoMode, onClose, onSubmitted }: Props) {
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  }

  async function handleSubmit() {
    if (photos.length === 0) {
      setError("Add at least one photo showing the completed work.");
      return;
    }
    if (notes.trim().length < 10) {
      setError("Describe what was done (at least 10 characters).");
      return;
    }
    setSubmitting(true);
    setError("");
    if (!demoMode) {
      const { error: submitError } = await submitProofOfWork(jobId, bidId, notes.trim(), photos);
      setSubmitting(false);
      if (submitError) {
        setError(submitError);
        return;
      }
    } else {
      setSubmitting(false);
    }
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F0E0C", border: "1px solid #2A2A25" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1E1A" }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--color-ochre)" }}>Proof of work</p>
            <h2 className="font-sans text-[16px] font-semibold" style={{ color: "var(--color-cream)" }}>{jobTitle}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "#5A5A50" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="font-sans text-[13px] leading-relaxed" style={{ color: "#5A5A50" }}>
            Upload photos of the finished job. An admin will review your proof and release payment once verified.
          </p>

          <div>
            <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
              Completion photos ({photos.length}/5)
            </label>
            <label
              className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all"
              style={{ backgroundColor: "#0D0D0B", border: "2px dashed #2A2A25", padding: "24px 16px" }}
            >
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPhotoChange} />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5A5A50" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p className="font-sans text-[13px] mt-2 font-medium" style={{ color: "var(--color-cream)" }}>Add photos</p>
            </label>
            {photos.length > 0 && (
              <ul className="mt-2 space-y-1">
                {photos.map((f, i) => (
                  <li key={i} className="font-sans text-[12px]" style={{ color: "#7A7A6A" }}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
              What was completed?
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work done, materials used, and anything the customer should know…"
              className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
              style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
            />
          </div>

          {error && (
            <p className="font-sans text-[13px] rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: "#1E1E1A" }}>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full h-11 rounded-xl font-sans text-[14px] font-semibold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
          >
            {submitting ? "Submitting…" : "Submit proof for admin review"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
