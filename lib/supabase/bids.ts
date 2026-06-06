import { createClient } from "./client";

export async function submitBid(jobId: string, amount: number, message: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("bids").insert({
    job_id: jobId,
    artisan_id: user.id,
    amount,
    message,
    status: "pending",
  });

  return { error: error?.message ?? null };
}

export async function acceptBid(bidId: string, jobId: string) {
  const supabase = createClient();

  // Mark this bid as accepted
  const { error: e1 } = await supabase
    .from("bids").update({ status: "accepted" }).eq("id", bidId);

  // Decline all other bids on this job
  const { error: e2 } = await supabase
    .from("bids").update({ status: "declined" })
    .eq("job_id", jobId).neq("id", bidId);

  // Move job to in_progress
  const { error: e3 } = await supabase
    .from("jobs").update({ status: "in_progress" }).eq("id", jobId);

  return { error: e1?.message ?? e2?.message ?? e3?.message ?? null };
}

export async function declineBid(bidId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bids").update({ status: "declined" }).eq("id", bidId);
  return { error: error?.message ?? null };
}

export async function markJobComplete(jobId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("jobs").update({ status: "completed" }).eq("id", jobId);
  return { error: error?.message ?? null };
}
