"use client";

import Link from "next/link";
import Image from "next/image";

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
      { label: "Contact Us", href: "mailto:Fixoraglobalhub@gmail.com" },
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

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

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
            <div className="inline-flex rounded-xl p-2" style={{ backgroundColor: "#fff" }}>
              <Image src="/Logo no bcakground.png" alt="FIXORA" width={160} height={160} className="rounded-lg" />
            </div>
            <p className="mt-4 font-sans text-[14px] leading-relaxed max-w-xs" style={{ color: "var(--color-muted)" }}>
              Nigeria&apos;s smart marketplace connecting customers with verified artisans nationwide.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {[TwitterIcon, InstagramIcon, LinkedInIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="transition-colors duration-200"
                  style={{ color: "var(--color-muted)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ochre)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-muted)")}
                  aria-label="Social link"
                >
                  <Icon />
                </a>
              ))}
            </div>
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
          <a
            href="mailto:Fixoraglobalhub@gmail.com"
            className="font-sans text-[13px] transition-colors duration-200"
            style={{ color: "var(--color-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ochre)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-muted)")}
          >
            Fixoraglobalhub@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
