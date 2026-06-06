const BASE = "https://api.paystack.co";

const headers = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export async function initializeTransaction(opts: {
  email: string;
  amount: number; // in kobo (naira × 100)
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers,
    body: JSON.stringify(opts),
  });
  return res.json() as Promise<{ status: boolean; data: { authorization_url: string; reference: string } }>;
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, { headers });
  return res.json() as Promise<{
    status: boolean;
    data: { status: string; amount: number; reference: string; metadata: Record<string, unknown> };
  }>;
}

export function validateWebhook(signature: string, body: string): boolean {
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
  return hash === signature;
}
