"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TransactionWithCompletion } from "@/lib/supabase/completions";

interface Props {
  transactions: TransactionWithCompletion[];
  demoMode: boolean;
  onReview?: (
    completionId: string,
    transactionId: string,
    jobId: string,
    decision: "approved" | "rejected",
    notes?: string,
  ) => Promise<void>;
}

export default function TransactionReviewPanel({ transactions, demoMode, onReview }: Props) {
  const [local, setLocal] = useState(transactions);
  const [selected, setSelected] = useState<TransactionWithCompletion | null>(null);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => setLocal(transactions), [transactions]);

  const needsReview = local.filter(
    (t) => t.status === "proof_submitted" && t.completion?.status === "submitted",
  );
  const inEscrow = local.filter((t) => t.status === "in_escrow" && !t.completion);
  const done = local.filter((t) => t.status === "paid" || t.completion?.status === "approved");

  async function handleDecision(decision: "approved" | "rejected") {
    if (!selected?.completion || !selected.job_id) return;
    setActing(true);

    if (demoMode) {
      setLocal((prev) =>
        prev.map((t) => {
          if (t.id !== selected.id) return t;
          const now = new Date().toISOString();
          return {
            ...t,
            status: decision === "approved" ? "paid" : "in_escrow",
            released_at: decision === "approved" ? now : t.released_at,
            admin_notes: notes || null,
            completion: {
              ...t.completion!,
              status: decision,
              reviewed_at: now,
              admin_notes: notes || null,
            },
          };
        }),
      );
      setSelected(null);
      setNotes("");
      setActing(false);
      return;
    }

    if (onReview) {
      await onReview(
        selected.completion.id,
        selected.id,
        selected.job_id,
        decision,
        notes,
      );
    }
    setSelected(null);
    setNotes("");
    setActing(false);
  }

  if (local.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
        <p className="font-sans text-[14px] mb-2" style={{ color: "var(--color-cream)" }}>No transactions yet</p>
        <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>Payments and escrow releases appear here.</p>
      </div>
    );
  }

  return (
    <>
      <p className="font-sans text-[13px] mb-4" style={{ color: "#5A5A50" }}>
        Review proof of work submitted by artisans, then verify and release payment. All payouts are confirmed manually by admin.
      </p>

      {needsReview.length > 0 && (
        <Section title={`Proof awaiting review (${needsReview.length})`} accent="var(--color-ochre)">
          {needsReview.map((t) => (
            <TxnRow key={t.id} t={t} onReview={() => { setSelected(t); setNotes(""); }} highlight />
          ))}
        </Section>
      )}

      {inEscrow.length > 0 && (
        <Section title={`In escrow — no proof yet (${inEscrow.length})`} accent="#3B82F6">
          {inEscrow.map((t) => (
            <TxnRow key={t.id} t={t} onReview={() => { setSelected(t); setNotes(""); }} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Paid / completed" accent="#5A5A50">
          {done.map((t) => (
            <TxnRow key={t.id} t={t} onReview={() => { setSelected(t); setNotes(t.admin_notes ?? ""); }} />
          ))}
        </Section>
      )}

      <AnimatePresence>
        {selected && (
          <ReviewModal
            txn={selected}
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

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: accent }}>{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function TxnRow({
  t,
  onReview,
  highlight,
}: {
  t: TransactionWithCompletion;
  onReview: () => void;
  highlight?: boolean;
}) {
  const artisan = t.artisan?.full_name ?? "Artisan";
  const job = t.job?.title ?? "Job";
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
      style={{
        backgroundColor: highlight ? "rgba(200,134,26,0.06)" : "#111110",
        border: `1px solid ${highlight ? "rgba(200,134,26,0.2)" : "#1E1E1A"}`,
      }}
    >
      <div className="min-w-0">
        <p className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>{job}</p>
        <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>
          {artisan} · ₦{Number(t.amount).toLocaleString()} · {t.reference.slice(0, 18)}…
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={t.status} completionStatus={t.completion?.status} />
        <button
          type="button"
          onClick={onReview}
          className="h-8 px-3 rounded-lg font-sans text-[12px] font-semibold cursor-pointer"
          style={{ backgroundColor: "rgba(200,134,26,0.12)", color: "var(--color-ochre)", border: "1px solid rgba(200,134,26,0.25)" }}
        >
          Review
        </button>
      </div>
    </div>
  );
}

function ReviewModal({
  txn,
  notes,
  onNotesChange,
  acting,
  onClose,
  onApprove,
  onReject,
}: {
  txn: TransactionWithCompletion;
  notes: string;
  onNotesChange: (n: string) => void;
  acting: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const canAct = txn.completion?.status === "submitted" && txn.status === "proof_submitted";
  const artisan = txn.artisan?.full_name ?? "Artisan";
  const customer = txn.customer?.full_name ?? "Customer";

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
            <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--color-ochre)" }}>Payment release</p>
            <h2 className="font-sans text-[18px] font-semibold" style={{ color: "var(--color-cream)" }}>{txn.job?.title ?? "Transaction"}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "#5A5A50" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoBox label="Artisan" value={artisan} />
            <InfoBox label="Customer" value={customer} />
            <InfoBox label="Amount" value={`₦${Number(txn.amount).toLocaleString()}`} accent />
            <InfoBox label="Reference" value={txn.reference} mono />
          </div>

          {txn.completion ? (
            <>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>Artisan notes</p>
                <p className="font-sans text-[14px] leading-relaxed" style={{ color: "#7A7A6A" }}>{txn.completion.notes ?? "—"}</p>
              </div>

              {txn.completion.photo_urls?.length > 0 && (
                <div>
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>Proof photos</p>
                  <div className="grid grid-cols-2 gap-3">
                    {txn.completion.photo_urls.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden aspect-[4/3]" style={{ border: "1px solid #2A2A25" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="font-sans text-[13px] rounded-xl px-4 py-3" style={{ backgroundColor: "#111110", color: "#5A5A50", border: "1px solid #1E1E1A" }}>
              Artisan has not submitted proof of work yet. Payment remains in escrow.
            </p>
          )}

          <div>
            <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
              Admin notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              placeholder="Verification note or reason for rejection…"
              className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
              style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25", color: "var(--color-cream)" }}
              disabled={!canAct}
            />
          </div>
        </div>

        {canAct && (
          <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "#1E1E1A" }}>
            <button
              type="button"
              disabled={acting}
              onClick={onReject}
              className="flex-1 h-11 rounded-xl font-sans text-[14px] font-semibold disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "rgba(232,69,69,0.1)", color: "#E84545", border: "1px solid rgba(232,69,69,0.25)" }}
            >
              Reject proof
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={onApprove}
              className="flex-1 h-11 rounded-xl font-sans text-[14px] font-semibold disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
            >
              {acting ? "Processing…" : "Verify work & release payment"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InfoBox({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}>
      <p className="font-sans text-[10px] uppercase tracking-wider mb-1" style={{ color: "#5A5A50" }}>{label}</p>
      <p
        className={`text-[14px] ${mono ? "font-mono text-[12px]" : "font-sans font-medium"}`}
        style={{ color: accent ? "var(--color-ochre)" : "var(--color-cream)" }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status, completionStatus }: { status: string; completionStatus?: string }) {
  const label = status === "proof_submitted" ? "proof submitted" : status.replace("_", " ");
  const color =
    status === "paid" ? "#2ECC6A"
    : status === "proof_submitted" ? "var(--color-ochre)"
    : status === "in_escrow" ? "#3B82F6"
    : "#7A7A6A";

  return (
    <span
      className="font-sans text-[11px] rounded-full px-2.5 py-1 font-semibold"
      style={{
        backgroundColor: `${color}14`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {completionStatus === "rejected" ? "proof rejected" : label}
    </span>
  );
}
