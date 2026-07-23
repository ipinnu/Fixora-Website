"use client";

import Link from "next/link";
import BrandLogo from "@/components/shared/BrandLogo";
import {
  OFFICIAL_EMAIL,
  OFFICIAL_PHONE_DISPLAY,
  officialEmailMailto,
  officialPhoneTel,
} from "@/lib/site-contact";

const sections = [
  {
    heading: "Marketplace",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Find Artisans", href: "/artisans" },
      { label: "Post a Job", href: "/post-job" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Verification", href: "/verification" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Become an Artisan", href: "/signup" },
      { label: "Call Us", href: officialPhoneTel },
      { label: "Contact Us", href: officialEmailMailto },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <BrandLogo size={72} />
            <p className="mt-4 font-sans text-[14px] leading-relaxed max-w-xs" style={{ color: "var(--color-muted)" }}>
              Nigeria&apos;s smart marketplace connecting customers with verified artisans nationwide.
            </p>
          </div>

          {/* Link columns */}
          {sections.map((s) => (
            <div key={s.heading}>
              <h4
                className="font-sans text-[12px] font-semibold tracking-[0.1em] uppercase mb-4"
                style={{ color: "var(--color-border-light)" }}
              >
                {s.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-sans text-[14px] transition-colors duration-200"
                      style={{ color: "var(--color-muted)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-muted)")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="font-sans text-[13px]" style={{ color: "var(--color-muted)" }}>
            © 2026 FIXORA. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a
              href={officialPhoneTel}
              className="font-sans text-[13px] transition-colors duration-200"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ochre)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-muted)")}
            >
              {OFFICIAL_PHONE_DISPLAY}
            </a>
            <a
              href={officialEmailMailto}
              className="font-sans text-[13px] transition-colors duration-200"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ochre)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-muted)")}
            >
              {OFFICIAL_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
