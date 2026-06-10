"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArtisanVerificationRow } from "@/lib/supabase/verification";

interface VerificationReviewPanelProps {
  verifications: ArtisanVerificationRow[];
  demoMode: boolean;
  onReview?: (id: string, artisanId: string, decision: "approved" | "rejected", notes?: string) => Promise<void>;
}

export default function VerificationReviewPanel({
  verifications,
  demoMode,
  onReview,
}: VerificationReviewPanelProps) {
  const [selected, setSelected] = useState<ArtisanVerificationRow | null>(null);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [local, setLocal] = useState(verifications);

  useEffect(() => setLocal(verifications), [verifications]);

  const pending = local.filter((v) => v.status === "pending");
  const reviewed = local.filter((v) => v.status !== "pending");

  async function handleDecision(decision: "approved" | "rejected") {
    if (!selected) return;
    setActing(true);
    if (demoMode) {
      setLocal((prev) =>
        prev.map((v) =>
          v.id === selected.id
            ? { ...v, status: decision, reviewed_at: new Date().toISOString(), admin_notes: notes || null }
            : v,
        ),
      );
      setSelected(null);
      setNotes("");
      setActing(false);
      return;
    }
    if (onReview) {
      await onReview(selected.id, selected.artisan_id, decision, notes);
    }
    setSelected(null);
    setNotes("");
    setActing(false);
  }

  if (local.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
        <p className="font-sans text-[14px] mb-2" style={{ color: "var(--color-cream)" }}>Verification queue</p>
        <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>
          Artisans who submit NIN and ID photos appear here for manual review.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="font-sans text-[13px] mb-4" style={{ color: "#5A5A50" }}>
        Review each application by hand — verify the NIN and compare the government ID photo with the live face scan before approving.
      </p>

      {pending.length > 0 && (
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--color-ochre)" }}>
            Pending review ({pending.length})
          </p>
          <div className="flex flex-col gap-2">
            {pending.map((v) => (
              <VerificationRow key={v.id} v={v} onReview={() => { setSelected(v); setNotes(""); }} />
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "#5A5A50" }}>
            Recently reviewed
          </p>
          <div className="flex flex-col gap-2">
            {reviewed.map((v) => (
              <VerificationRow key={v.id} v={v} onReview={() => { setSelected(v); setNotes(v.admin_notes ?? ""); }} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ReviewModal
            verification={selected}
            notes={notes}
            onNotesChange={setNotes}
            acting={acting}
            onClose={() => setSelected(null)}
            onApprove={() => handleDecision("approved")}
            onReject={() => handleDecision("rejected")}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function VerificationRow({ v, onReview }: { v: ArtisanVerificationRow; onReview: () => void }) {
  const name = v.artisan?.full_name ?? "Artisan";
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
      style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
    >
      <div className="min-w-0">
        <p className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>{name}</p>
        <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>
          {v.trade ?? v.artisan?.trade ?? "—"} · {v.artisan?.state ?? "—"} · NIN {maskNin(v.nin)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={v.status} />
        <button
          type="button"
          onClick={onReview}
          className="h-8 px-3 rounded-lg font-sans text-[12px] font-semibold transition-colors cursor-pointer"
          style={{ backgroundColor: "rgba(200,134,26,0.12)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.25)" }}
        >
          Review
        </button>
      </div>
    </div>
  );
}

function ReviewModal({
  verification: v,
  notes,
  onNotesChange,
  acting,
  onClose,
  onApprove,
  onReject,
}: {
  verification: ArtisanVerificationRow;
  notes: string;
  onNotesChange: (n: string) => void;
  acting: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const name = v.artisan?.full_name ?? "Artisan";
  const isPending = v.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F0E0C", border: "1px solid #2A2A25", maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1E1A" }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--color-ochre)" }}>Manual verification</p>
            <h2 className="font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>{name}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "#5A5A50" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>NIN</p>
            <p className="font-mono text-[18px] tracking-widest" style={{ color: "var(--color-cream)" }}>{v.nin}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <DocPreview label="Government ID" url={v.id_document_url} />
            <DocPreview label="Live face scan" url={v.face_photo_url} placeholder="No face photo" />
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A5A50" }}>Profile details</p>
            <p className="font-sans text-[13px]" style={{ color: "#7A7A6A" }}><span style={{ color: "#5A5A50" }}>Trade:</span> {v.trade ?? "—"}</p>
            <p className="font-sans text-[13px]" style={{ color: "#7A7A6A" }}><span style={{ color: "#5A5A50" }}>Experience:</span> {v.years_experience ?? "—"}</p>
            {v.bio && <p className="font-sans text-[13px] leading-relaxed" style={{ color: "#7A7A6A" }}>{v.bio}</p>}
          </div>

          <div>
            <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
              Admin notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              placeholder="Reason for rejection or internal note…"
              className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
              style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
            />
          </div>
        </div>

        {isPending && (
          <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "#1E1E1A" }}>
            <button
              type="button"
              disabled={acting}
              onClick={onReject}
              className="flex-1 h-11 rounded-xl font-sans text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "rgba(232,69,69,0.1)", color: "#E84545", border: "1px solid rgba(232,69,69,0.25)" }}
            >
              Reject
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={onApprove}
              className="flex-1 h-11 rounded-xl font-sans text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
            >
              {acting ? "Saving…" : "Approve artisan"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DocPreview({ label, url, placeholder }: { label: string; url: string | null; placeholder?: string }) {
  return (
    <div>
      <p className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>{label}</p>
      <div className="rounded-xl overflow-hidden aspect-[4/3] relative" style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25" }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-sans text-[12px]" style={{ color: "#5A5A50" }}>
            {placeholder ?? "No image"}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="font-sans text-[11px] rounded-full px-2.5 py-1 font-semibold"
      style={{
        backgroundColor: status === "pending" ? "rgba(200,134,26,0.1)" : status === "approved" ? "rgba(46,204,106,0.08)" : "rgba(232,69,69,0.08)",
        color: status === "pending" ? "var(--color-ochre)" : status === "approved" ? "#2ECC6A" : "#E84545",
      }}
    >
      {status}
    </span>
  );
}

function maskNin(nin: string) {
  if (nin.length < 4) return nin;
  return `•••••••${nin.slice(-4)}`;
}
