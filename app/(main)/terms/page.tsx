import type { Metadata } from "next";
import {
  OFFICIAL_PHONE_DISPLAY,
  officialPhoneTel,
} from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Terms of Service — FIXORA",
  description: "Read FIXORA's terms of service for customers and artisans.",
};

const SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By accessing or using the FIXORA platform, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please do not use the platform." },
  { title: "2. Platform Description", body: "FIXORA is a marketplace connecting customers who need repair, maintenance, or installation services with qualified artisans across Nigeria. We facilitate connections but are not directly responsible for the quality of services rendered." },
  { title: "3. User Accounts", body: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. FIXORA reserves the right to suspend accounts that violate these terms." },
  { title: "4. Artisan Obligations", body: "Artisans must provide accurate information about their skills and qualifications. They agree to complete jobs professionally, as described in their bids, and to resolve disputes in good faith." },
  { title: "5. Customer Obligations", body: "Customers must post accurate job descriptions. They agree to pay the agreed amount upon satisfactory completion of work, using the FIXORA escrow system." },
  { title: "6. Escrow and Payments", body: "All payments are processed through our escrow system powered by Paystack. Funds are held securely and released to artisans only when customers confirm job completion. FIXORA charges a 5% service fee on all transactions." },
  { title: "7. Dispute Resolution", body: "In case of disputes, both parties are encouraged to communicate through the FIXORA messaging system. If resolution cannot be reached, FIXORA may mediate. FIXORA's decision in disputes is final." },
  { title: "8. Prohibited Activities", body: "Users may not use the platform to: post false or misleading information, engage in fraud, circumvent the escrow system, harass other users, or violate any applicable Nigerian law." },
  { title: "9. Limitation of Liability", body: "FIXORA is not liable for any damages arising from services provided by artisans, disputes between users, or platform downtime. Our maximum liability is limited to fees paid to FIXORA in the previous 30 days." },
  { title: "10. Changes to Terms", body: "FIXORA reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#0D0D0B" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: "var(--color-ochre)" }}>Legal</p>
        <h1 className="font-serif mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--color-cream)" }}>Terms of Service</h1>
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
            Questions? Contact us at{" "}
            <a href="mailto:legal@fixora.ng" style={{ color: "var(--color-ochre)" }}>legal@fixora.ng</a>
            {" "}or call{" "}
            <a href={officialPhoneTel} style={{ color: "var(--color-ochre)" }}>{OFFICIAL_PHONE_DISPLAY}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
