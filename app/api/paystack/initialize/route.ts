import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bidId, jobId } = await req.json();

  // Fetch bid amount and job title
  const { data: bid } = await supabase.from("bids").select("amount, artisan_id, jobs(title, customer_id)").eq("id", bidId).single();
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const reference = `fixora_${bidId}_${Date.now()}`;
  const amountKobo = bid.amount * 100;

  const result = await initializeTransaction({
    email: user.email!,
    amount: amountKobo,
    reference,
    callback_url: `${req.nextUrl.origin}/pay/callback?reference=${reference}`,
    metadata: {
      bid_id: bidId,
      job_id: jobId,
      customer_id: user.id,
      artisan_id: bid.artisan_id,
      customer_name: profile?.full_name,
    },
  });

  if (!result.status) return NextResponse.json({ error: "Payment init failed" }, { status: 500 });

  // Record pending transaction
  await supabase.from("transactions").insert({
    bid_id: bidId,
    job_id: jobId,
    customer_id: user.id,
    artisan_id: bid.artisan_id,
    amount: bid.amount,
    reference,
    status: "pending",
  });

  return NextResponse.json({ url: result.data.authorization_url });
}
