import { createClient } from "./client";

export type CompletionStatus = "submitted" | "approved" | "rejected";

export interface JobCompletionRow {
  id: string;
  job_id: string;
  bid_id: string;
  artisan_id: string;
  transaction_id: string | null;
  notes: string | null;
  photo_urls: string[];
  status: CompletionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}

export interface TransactionWithCompletion {
  id: string;
  bid_id: string | null;
  job_id: string | null;
  customer_id: string | null;
  artisan_id: string | null;
  amount: number;
  reference: string;
  status: string;
  created_at: string;
  released_at: string | null;
  admin_notes: string | null;
  job?: { title: string | null } | null;
  artisan?: { full_name: string | null } | null;
  customer?: { full_name: string | null } | null;
  completion?: JobCompletionRow | null;
}

export async function submitProofOfWork(
  jobId: string,
  bidId: string,
  notes: string,
  photoFiles: File[],
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const photoUrls: string[] = [];
  const ts = Date.now();

  for (let i = 0; i < photoFiles.length; i++) {
    const path = `${user.id}/${jobId}_${ts}_${i}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("job-completion-photos")
      .upload(path, photoFiles[i], { upsert: true });
    if (uploadError) return { error: uploadError.message };
    const url = supabase.storage.from("job-completion-photos").getPublicUrl(path).data.publicUrl;
    photoUrls.push(url);
  }

  const { data: txn } = await supabase
    .from("transactions")
    .select("id")
    .eq("bid_id", bidId)
    .maybeSingle();

  const { error: completionError } = await supabase.from("job_completions").upsert({
    job_id: jobId,
    bid_id: bidId,
    artisan_id: user.id,
    transaction_id: txn?.id ?? null,
    notes,
    photo_urls: photoUrls,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    admin_notes: null,
  }, { onConflict: "job_id" });

  if (completionError) return { error: completionError.message };

  if (txn?.id) {
    const { error: txnError } = await supabase
      .from("transactions")
      .update({ status: "proof_submitted" })
      .eq("id", txn.id);
    if (txnError) return { error: txnError.message };
  }

  return { error: null };
}

export async function fetchCompletionForBid(bidId: string): Promise<JobCompletionRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("job_completions")
    .select("*")
    .eq("bid_id", bidId)
    .maybeSingle();
  return data as JobCompletionRow | null;
}

export async function fetchAllTransactionsWithCompletions(): Promise<TransactionWithCompletion[]> {
  const supabase = createClient();

  const [{ data: txns }, { data: completions }] = await Promise.all([
    supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    supabase.from("job_completions").select("*"),
  ]);

  const jobIds = [...new Set((txns ?? []).map((t) => t.job_id).filter(Boolean))] as string[];
  const profileIds = [...new Set(
    (txns ?? []).flatMap((t) => [t.artisan_id, t.customer_id]).filter(Boolean),
  )] as string[];

  const [{ data: jobs }, { data: profiles }] = await Promise.all([
    jobIds.length
      ? supabase.from("jobs").select("id, title").in("id", jobIds)
      : Promise.resolve({ data: [] }),
    profileIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", profileIds)
      : Promise.resolve({ data: [] }),
  ]);

  const jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const completionByTxn = new Map(
    (completions ?? []).filter((c) => c.transaction_id).map((c) => [c.transaction_id, c]),
  );
  const completionByJob = new Map((completions ?? []).map((c) => [c.job_id, c]));

  return (txns ?? []).map((t) => {
    const completion = completionByTxn.get(t.id) ?? completionByJob.get(t.job_id ?? "") ?? null;
    return {
      ...t,
      job: jobMap.get(t.job_id ?? "") ?? null,
      artisan: profileMap.get(t.artisan_id ?? "") ?? null,
      customer: profileMap.get(t.customer_id ?? "") ?? null,
      completion: completion as JobCompletionRow | null,
    } as TransactionWithCompletion;
  });
}

export async function adminReviewProofAndRelease(
  completionId: string,
  transactionId: string,
  jobId: string,
  decision: "approved" | "rejected",
  adminNotes?: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error: cError } = await supabase
    .from("job_completions")
    .update({
      status: decision,
      reviewed_at: now,
      admin_notes: adminNotes ?? null,
    })
    .eq("id", completionId);

  if (cError) return { error: cError.message };

  if (decision === "rejected") {
    const { error: tError } = await supabase
      .from("transactions")
      .update({ status: "in_escrow", admin_notes: adminNotes ?? null })
      .eq("id", transactionId);
    if (tError) return { error: tError.message };
    return { error: null };
  }

  const { error: tError } = await supabase
    .from("transactions")
    .update({
      status: "paid",
      released_at: now,
      admin_notes: adminNotes ?? null,
    })
    .eq("id", transactionId);

  if (tError) return { error: tError.message };

  const { error: jError } = await supabase
    .from("jobs")
    .update({ status: "completed" })
    .eq("id", jobId);

  if (jError) return { error: jError.message };

  return { error: null };
}
