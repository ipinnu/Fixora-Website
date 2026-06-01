"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Verification", href: "/verification" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "rgba(13,13,11,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-serif text-[22px] leading-none"
            style={{ color: "var(--color-ochre)" }}
          >
            FIXORA
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative font-sans text-[14px] transition-colors duration-200"
                  style={{
                    color: active ? "var(--color-ochre)" : "var(--color-sand)",
                  }}
                  onMouseEnter={(e) =>
                    !active && ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")
                  }
                  onMouseLeave={(e) =>
                    !active && ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sand)")
                  }
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                      style={{ backgroundColor: "var(--color-ochre)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="font-sans text-[14px] transition-colors duration-200"
              style={{ color: "var(--color-sand)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sand)")}
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="rounded-full px-5 py-2 font-sans text-[14px] font-semibold transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-ochre)",
                  color: "#0D0D0B",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-ochre-light)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-ochre)")}
              >
                Sign Up
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            style={{ color: "var(--color-sand)" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="4" y1="4" x2="18" y2="18" />
                  <line x1="18" y1="4" x2="4" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="19" y2="6" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="16" x2="19" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-sans text-[15px] py-1"
                  style={{
                    color: pathname === l.href ? "var(--color-ochre)" : "var(--color-sand)",
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <Link href="/login" className="font-sans text-[14px]" style={{ color: "var(--color-sand)" }} onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full px-5 py-2 font-sans text-[14px] font-semibold"
                  style={{ backgroundColor: "var(--color-ochre)", color: "#0D0D0B" }}
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
