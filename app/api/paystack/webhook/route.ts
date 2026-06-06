import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateWebhook, verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const body = await req.text();

  if (!validateWebhook(signature, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as { event: string; data: { reference: string } };

  if (event.event === "charge.success") {
    const { data } = await verifyTransaction(event.data.reference);
    if (data.status !== "success") return NextResponse.json({ ok: true });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    );

    // Mark transaction as paid (escrow)
    await supabase.from("transactions").update({ status: "in_escrow" }).eq("reference", data.reference);

    // Get metadata
    const meta = data.metadata as { bid_id: string; job_id: string };

    // Accept the bid and update job status
    await supabase.from("bids").update({ status: "accepted" }).eq("id", meta.bid_id);
    await supabase.from("bids").update({ status: "declined" }).eq("job_id", meta.job_id).neq("id", meta.bid_id);
    await supabase.from("jobs").update({ status: "in_progress" }).eq("id", meta.job_id);

    // Notify artisan
    const { data: txn } = await supabase.from("transactions").select("artisan_id, amount").eq("reference", data.reference).single();
    if (txn) {
      await supabase.from("notifications").insert({
        user_id: txn.artisan_id,
        type: "bid_accepted",
        title: "Your bid was accepted!",
        body: `₦${Number(txn.amount).toLocaleString()} is being held in escrow`,
        data: { job_id: meta.job_id },
      });
    }
  }

  if (event.event === "transfer.success") {
    await (async () => {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
      );
      await supabase.from("transactions").update({ status: "paid" }).eq("reference", event.data.reference);
    })();
  }

  return NextResponse.json({ ok: true });
}
