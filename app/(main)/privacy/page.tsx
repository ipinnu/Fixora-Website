import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FIXORA",
  description: "How FIXORA collects, uses, and protects your personal data.",
};

const SECTIONS = [
  { title: "1. Data We Collect", body: "We collect information you provide when creating an account (name, email, phone, location), job postings (descriptions, photos, budget), and transaction data. We also collect usage data like pages visited and actions taken." },
  { title: "2. How We Use Your Data", body: "We use your data to: match customers with suitable artisans, process payments through Paystack, send service-related notifications (bids, job updates), improve the platform, and comply with Nigerian law." },
  { title: "3. Data Sharing", body: "We share limited data with: Paystack (payment processing), Resend (transactional emails), and Supabase (data storage). We do not sell your personal data to third parties." },
  { title: "4. Data Storage", body: "Your data is stored securely in Supabase's EU-based servers. Photos are stored in Supabase Storage with access controls. We retain your data for the duration of your account and up to 2 years after closure." },
  { title: "5. Your Rights", body: "You have the right to: access your personal data, correct inaccurate data, request deletion of your account, export your data, and opt out of marketing emails. Contact us at privacy@fixora.ng to exercise these rights." },
  { title: "6. Cookies", body: "We use essential cookies for authentication and session management. We do not use advertising or tracking cookies." },
  { title: "7. Children's Privacy", body: "FIXORA is not intended for users under 18. We do not knowingly collect data from minors." },
  { title: "8. Security", body: "We use industry-standard encryption (TLS/SSL), row-level security in our database, and secure payment processing via Paystack. We never store card details." },
  { title: "9. Contact", body: "For privacy concerns, contact our Data Protection Officer at privacy@fixora.ng or write to: FIXORA, Lagos, Nigeria." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-ochre)" }}>Legal</p>
        <h1 className="font-serif mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--color-cream)" }}>Privacy Policy</h1>
        <p className="font-sans text-[14px] mb-12" style={{ color: "#5A5A50" }}>Last updated: June 2026</p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="font-sans text-[16px] font-semibold mb-3" style={{ color: "var(--color-cream)" }}>{s.title}</h2>
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: "#7A7A6A" }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: "#1E1E1A" }}>
          <p className="font-sans text-[13px]" style={{ color: "#5A5A50" }}>
            Privacy questions? Email{" "}
            <a href="mailto:privacy@fixora.ng" style={{ color: "var(--color-ochre)" }}>privacy@fixora.ng</a>
          </p>
        </div>
      </div>
    </div>
  );
}
