"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession } from "@/lib/demo-session";

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Tasks", href: "/jobs" },
  { label: "Artisans", href: "/artisans" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ initials: string; name: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { setUser(null); setAuthLoading(false); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .single();

        const name = profile?.full_name ?? authUser.email ?? "User";
        const initials = name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        setUser({ initials, name: name.split(" ")[0], role: profile?.role ?? "customer" });
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearDemoSession();
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleSignOutClick = () => {
    setOpen(false);
    setShowSignOutConfirm(true);
  };

  const dashboardHref = user?.role === "artisan" ? "/artisan" : "/customer";

  return (
    <>
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
                  style={{ color: active ? "var(--color-ochre)" : "var(--color-sand)" }}
                  onMouseEnter={(e) => !active && ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
                  onMouseLeave={(e) => !active && ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sand)")}
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
          <div className="hidden md:flex items-center gap-3">
            {!authLoading && (
              <>
                {user ? (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/post-job"
                        className="rounded-full px-5 py-2 font-sans text-[14px] font-semibold transition-all duration-200 border"
                        style={{ borderColor: "rgba(200,134,26,0.35)", color: "var(--color-ochre)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(200,134,26,0.08)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-ochre)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,134,26,0.35)"; }}
                      >
                        Post a Task
                      </Link>
                    </motion.div>

                    <Link
                      href={dashboardHref}
                      className="font-sans text-[14px] transition-colors duration-200"
                      style={{ color: "var(--color-sand)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sand)")}
                    >
                      My Dashboard
                    </Link>

                    <div className="flex items-center gap-2 pl-1">
                      <Link href={dashboardHref} title={`Signed in as ${user.name}`}>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-sans text-[12px] font-semibold cursor-pointer transition-all duration-200"
                          style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                        >
                          {user.initials}
                        </div>
                      </Link>
                      <button
                        onClick={handleSignOutClick}
                        className="font-sans text-[13px] transition-colors duration-200"
                        style={{ color: "#5A5A50" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#E84545")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#5A5A50")}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/post-job"
                        className="rounded-full px-5 py-2 font-sans text-[14px] font-semibold transition-all duration-200 border"
                        style={{ borderColor: "rgba(200,134,26,0.35)", color: "var(--color-ochre)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(200,134,26,0.08)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-ochre)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,134,26,0.35)"; }}
                      >
                        Post a Task
                      </Link>
                    </motion.div>
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
                        style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.08)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.filter = "none")}
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </>
                )}
              </>
            )}
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
            style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
          >
            <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-sans text-[15px] py-1"
                  style={{ color: pathname === l.href ? "var(--color-ochre)" : "var(--color-sand)" }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-sans text-[12px] font-semibold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                      >
                        {user.initials}
                      </div>
                      <span className="font-sans text-[14px]" style={{ color: "var(--color-cream)" }}>
                        Hi, {user.name}
                      </span>
                    </div>
                    <Link
                      href="/post-job"
                      className="rounded-full px-5 py-2.5 font-sans text-[14px] font-semibold text-center"
                      style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                      onClick={() => setOpen(false)}
                    >
                      Post a Task
                    </Link>
                    <Link
                      href={dashboardHref}
                      className="rounded-full px-5 py-2.5 font-sans text-[14px] font-semibold text-center border"
                      style={{ borderColor: "rgba(200,134,26,0.3)", color: "var(--color-ochre)" }}
                      onClick={() => setOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleSignOutClick}
                      className="font-sans text-[14px] text-left py-1"
                      style={{ color: "#5A5A50" }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/post-job"
                      className="rounded-full px-5 py-2.5 font-sans text-[14px] font-semibold text-center"
                      style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
                      onClick={() => setOpen(false)}
                    >
                      Post a Task
                    </Link>
                    <div className="flex gap-3">
                      <Link href="/login" className="font-sans text-[14px]" style={{ color: "var(--color-sand)" }} onClick={() => setOpen(false)}>
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="rounded-full px-5 py-2 font-sans text-[14px] font-semibold border"
                        style={{ borderColor: "rgba(200,134,26,0.3)", color: "var(--color-ochre)" }}
                        onClick={() => setOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>

    <AnimatePresence>
      {showSignOutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5"
            style={{ background: "#1A1A14", border: "1px solid rgba(200,134,26,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[17px] font-semibold" style={{ color: "#F5F0E8" }}>Sign out?</p>
              <p className="font-sans text-[13px]" style={{ color: "#8A8A7A" }}>You'll need to sign in again to access your account.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 rounded-full py-2.5 font-sans text-[13px] font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "#C8C8B4" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSignOutConfirm(false); signOut(); }}
                className="flex-1 rounded-full py-2.5 font-sans text-[13px] font-semibold transition-colors"
                style={{ background: "linear-gradient(135deg, #C8861A, #E8A040)", color: "#0D0D0B" }}
              >
                Sign out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
