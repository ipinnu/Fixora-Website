import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "FIXORA — Nigeria's Smart Artisan Marketplace", template: "%s — FIXORA" },
  description: "Post a job, compare bids from verified artisans, and pay securely through escrow. Built for Nigeria.",
  keywords: ["artisan marketplace Nigeria", "hire plumber Lagos", "find electrician Nigeria", "home repair Nigeria", "verified artisans"],
  authors: [{ name: "FIXORA" }],
  creator: "FIXORA",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://fixora.ng",
    siteName: "FIXORA",
    title: "FIXORA — Nigeria's Smart Artisan Marketplace",
    description: "Post a job, compare bids from verified artisans, and pay securely through escrow. Built for Nigeria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIXORA — Nigeria's Smart Artisan Marketplace",
    description: "Post a job, compare bids from verified artisans, and pay securely through escrow.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject body attributes */}
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
