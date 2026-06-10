"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession, DEMO_ROUTES, setDemoSession, type DemoRole } from "@/lib/demo-session";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    clearDemoSession();
    const role = data.user?.user_metadata?.role;
    router.push(role === "artisan" ? "/artisan" : "/customer");
  };

  const handleDemoLogin = (role: DemoRole) => {
    setError("");
    setDemoSession(role);
    router.push(DEMO_ROUTES[role]);
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-2)", borderRight: "1px solid var(--color-border)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,134,26,0.07) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        <Link href="/">
          <div className="inline-flex rounded-xl p-2" style={{ backgroundColor: "#fff" }}>
              <Image src="/Logo no bcakground.png" alt="FIXORA" width={112} height={112} className="rounded-lg" />
            </div>
        </Link>

        <div>
          <blockquote
            className="font-serif mb-6 leading-snug"
            style={{ fontSize: "clamp(28px, 3vw, 42px)", color: "var(--color-cream)" }}
          >
            "I got three quotes in two hours and hired the best plumber I've ever worked with."
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-[14px]"
              style={{ backgroundColor: "var(--color-ochre-dim)", color: "var(--color-ochre-light)" }}
            >
              AA
            </div>
            <div>
              <p className="font-sans text-[14px] font-semibold" style={{ color: "var(--color-cream)" }}>Adaeze Anozie</p>
              <p className="font-sans text-[13px]" style={{ color: "var(--color-muted)" }}>Homeowner, Lagos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden mb-10">
          <div className="inline-flex rounded-xl p-2" style={{ backgroundColor: "#fff" }}>
              <Image src="/Logo no bcakground.png" alt="FIXORA" width={96} height={96} className="rounded-lg" />
            </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <h1
            className="font-serif mb-2"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--color-cream)" }}
          >
            Welcome back
          </h1>
          <p className="font-sans text-[15px] mb-8" style={{ color: "var(--color-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="transition-colors" style={{ color: "var(--color-ochre)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ochre-light)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ochre)")}
            >
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="h-12 rounded-xl border px-4 font-sans text-[15px] outline-none transition-colors duration-200 w-full"
                style={{
                  backgroundColor: "var(--color-bg-3)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-cream)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="font-sans text-[12px] transition-colors"
                  style={{ color: "var(--color-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ochre)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-muted)")}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="h-12 rounded-xl border px-4 pr-11 font-sans text-[15px] outline-none transition-colors duration-200 w-full"
                  style={{
                    backgroundColor: "var(--color-bg-3)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-cream)",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--color-muted)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-sand)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-muted)")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-sans text-[13px] rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(232,69,69,0.08)", color: "#E84545", border: "1px solid rgba(232,69,69,0.2)" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              className="mt-2 h-12 w-full rounded-full font-sans text-[15px] font-semibold transition-colors duration-200"
              style={{ backgroundColor: "var(--color-ochre)", color: "#0D0D0B", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre-light)"; }}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre)")}
            >
              {loading ? "Logging in…" : "Log in"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
            <span className="font-sans text-[12px]" style={{ color: "var(--color-muted)" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
            className="w-full h-12 rounded-full border font-sans text-[15px] font-medium flex items-center justify-center gap-3 transition-colors duration-200"
            style={{ borderColor: "var(--color-border)", color: "var(--color-cream)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-light)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Demo exploration logins */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-center mb-3" style={{ color: "var(--color-muted)" }}>
              Demo access
            </p>
            <p className="font-sans text-[12px] text-center mb-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Explore dashboards with sample data — no account needed
            </p>
            <div className="flex flex-col gap-2">
              {([
                { role: "customer" as DemoRole, label: "Demo Client", sub: "Homeowner dashboard" },
                { role: "artisan" as DemoRole, label: "Demo Artisan", sub: "Artisan dashboard" },
                { role: "admin" as DemoRole, label: "Demo Admin", sub: "Admin panel" },
              ]).map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  className="flex items-center justify-between h-11 px-4 rounded-xl border transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-bg-3)",
                    borderColor: "var(--color-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(200,134,26,0.35)";
                    e.currentTarget.style.backgroundColor = "rgba(200,134,26,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.backgroundColor = "var(--color-bg-3)";
                  }}
                >
                  <span className="font-sans text-[14px] font-medium" style={{ color: "var(--color-cream)" }}>
                    {item.label}
                  </span>
                  <span className="font-sans text-[11px]" style={{ color: "var(--color-muted)" }}>
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
