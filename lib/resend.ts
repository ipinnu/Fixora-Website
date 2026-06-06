import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  return _resend;
}
const FROM = "FIXORA <noreply@fixora.ng>";

export async function sendBidReceived(to: string, customerName: string, artisanName: string, jobTitle: string, amount: number, jobId: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `New bid on "${jobTitle}"`,
    html: emailTemplate({
      headline: `${artisanName} submitted a bid`,
      body: `<p>You received a bid of <strong>₦${amount.toLocaleString()}</strong> on your job <strong>${jobTitle}</strong>.</p>`,
      cta: { label: "Review the bid", url: `${process.env.NEXT_PUBLIC_SITE_URL}/customer` },
    }),
  });
}

export async function sendBidAccepted(to: string, artisanName: string, jobTitle: string, amount: number) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `Your bid was accepted — ${jobTitle}`,
    html: emailTemplate({
      headline: "Your bid was accepted! 🎉",
      body: `<p>Congratulations ${artisanName}! Your bid of <strong>₦${amount.toLocaleString()}</strong> for <strong>${jobTitle}</strong> was accepted. Payment is being held securely in escrow.</p>`,
      cta: { label: "Go to your dashboard", url: `${process.env.NEXT_PUBLIC_SITE_URL}/artisan` },
    }),
  });
}

export async function sendJobCompleted(to: string, customerName: string, jobTitle: string, artisanId: string, artisanName: string, jobId: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `Job complete — leave a review for ${artisanName}`,
    html: emailTemplate({
      headline: `${jobTitle} is marked complete`,
      body: `<p>Great news ${customerName}! Your job has been completed. Please leave a review to help other customers.</p>`,
      cta: { label: "Leave a review", url: `${process.env.NEXT_PUBLIC_SITE_URL}/review?artisan=${artisanId}&job=${jobId}&name=${encodeURIComponent(artisanName)}` },
    }),
  });
}

export async function sendPaymentReleased(to: string, artisanName: string, amount: number, jobTitle: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `₦${amount.toLocaleString()} released to your account`,
    html: emailTemplate({
      headline: "Payment released! 💰",
      body: `<p>Hi ${artisanName}, ₦${amount.toLocaleString()} for <strong>${jobTitle}</strong> has been released from escrow and is on its way to your account.</p>`,
      cta: { label: "View earnings", url: `${process.env.NEXT_PUBLIC_SITE_URL}/artisan` },
    }),
  });
}

function emailTemplate({ headline, body, cta }: { headline: string; body: string; cta: { label: string; url: string } }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0D0D0B;font-family:'DM Sans',Arial,sans-serif;color:#F2EDDF;padding:40px 20px}
    .card{background:#111110;border:1px solid #1E1E1A;border-radius:20px;max-width:520px;margin:0 auto;padding:40px}
    .logo{font-family:Georgia,serif;font-size:22px;color:#C8861A;margin-bottom:32px}
    h1{font-family:Georgia,serif;font-size:24px;color:#F2EDDF;margin-bottom:16px}
    p{font-size:15px;line-height:1.6;color:#A89A7A;margin-bottom:20px}
    .cta{display:inline-block;background:linear-gradient(135deg,#C8861A,#E8A040);color:#0D0D0B;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;margin-top:8px}
    .footer{text-align:center;margin-top:32px;font-size:12px;color:#3A3A33}
  </style></head><body>
  <div class="card">
    <div class="logo">FIXORA</div>
    <h1>${headline}</h1>
    ${body}
    <a href="${cta.url}" class="cta">${cta.label}</a>
  </div>
  <p class="footer">© ${new Date().getFullYear()} Fixora · Nigeria's Artisan Marketplace</p>
  </body></html>`;
}
