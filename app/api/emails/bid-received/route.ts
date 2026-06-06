import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendBidReceived } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { bidId } = await req.json();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );

  const { data: bid } = await supabase
    .from("bids")
    .select("amount, artisan:profiles!artisan_id(full_name), jobs(title, customer_id, customer:profiles!customer_id(full_name))")
    .eq("id", bidId).single();

  if (!bid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jobData = bid.jobs as unknown as Record<string, unknown>;
  const artisanData = bid.artisan as unknown as Record<string, unknown>;
  const customerData = (Array.isArray(jobData?.customer) ? jobData.customer[0] : jobData?.customer) as Record<string, unknown> | null;
  const { data: { user: customer } } = await supabase.auth.admin.getUserById(jobData?.customer_id as string);

  if (customer?.email) {
    await sendBidReceived(
      customer.email,
      customerData?.full_name as string ?? "Customer",
      (Array.isArray(artisanData) ? artisanData[0] : artisanData)?.full_name as string ?? "Artisan",
      jobData?.title as string,
      bid.amount,
      jobData?.id as string ?? "",
    );
  }

  return NextResponse.json({ ok: true });
}
