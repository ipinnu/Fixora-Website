"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession, DEMO_ROUTES, setDemoSession, type DemoRole } from "@/lib/demo-session";
import BrandLogo from "@/components/shared/BrandLogo";

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
          <BrandLogo size={112} href={null} />
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
          <BrandLogo size={88} href={null} />
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

          {/* Demo exploration logins */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-center mb-3" style={{ color: "var(--color-muted)" }}>
              Preview dashboards
            </p>
            <p className="font-sans text-[12px] text-center mb-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Explore with sample data — no account required
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
