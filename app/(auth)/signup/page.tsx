"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Briefcase, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession } from "@/lib/demo-session";
import CategorySelect from "@/components/CategorySelect";
import BrandLogo from "@/components/shared/BrandLogo";

type Role = "customer" | "artisan";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    trade: "",
    state: "",
  });

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: form.fullName.trim(),
            role,
            trade: role === "artisan" ? form.trade : "",
            state: role === "artisan" ? form.state : "",
          },
        },
      });

      if (signUpError) throw signUpError;

      clearDemoSession();
      if (data.session) {
        router.replace(role === "artisan" ? "/artisan" : "/customer");
        router.refresh();
      } else {
        router.replace(`/verify?email=${encodeURIComponent(email)}&role=${role}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-2)", borderRight: "1px solid var(--color-border)" }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px]"
          style={{ background: "radial-gradient(circle, rgba(200,134,26,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        {/* Logo */}
        <BrandLogo size={52} />

        {/* Middle content */}
        <div>
          <h2
            className="font-serif mb-3"
            style={{ fontSize: "clamp(28px, 3vw, 42px)", color: "var(--color-cream)", lineHeight: 1.2 }}
          >
            Join Nigeria&apos;s smartest service marketplace
          </h2>
          <p className="font-sans text-[15px] mb-10 leading-relaxed" style={{ color: "var(--color-sand)" }}>
            Whether you need a job done or you offer a skill — FIXORA connects both sides safely and simply.
          </p>

          <div className="space-y-5">
            {[
              { text: "Free to join — no credit card required" },
              { text: "Post unlimited jobs as a customer" },
              { text: "Get verified and start earning as an artisan" },
              { text: "Secure escrow payments on every job" },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-sans text-[11px] font-bold"
                  style={{ backgroundColor: "var(--color-green-dim)", color: "var(--color-green)" }}
                >
                  ✓
                </span>
                <span className="font-sans text-[15px]" style={{ color: "var(--color-sand)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="font-sans text-[13px]" style={{ color: "var(--color-muted)" }}>
          Trusted by 10,000+ users across all 36 states of Nigeria
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 overflow-y-auto">
        <div className="lg:hidden mb-10">
          <BrandLogo size={88} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          <h1
            className="font-serif mb-2"
            style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "var(--color-cream)" }}
          >
            Create your account
          </h1>
          <p className="font-sans text-[15px] mb-8" style={{ color: "var(--color-muted)" }}>
            Already have one?{" "}
            <Link href="/login" style={{ color: "var(--color-ochre)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ochre-light)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ochre)")}
            >
              Log in
            </Link>
          </p>

          {/* Role selector */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: "var(--color-bg-3)", border: "1px solid var(--color-border)" }}
          >
            {([
              { value: "customer" as Role, label: "I need help", Icon: Briefcase },
              { value: "artisan" as Role, label: "I offer services", Icon: Wrench },
            ] as { value: Role; label: string; Icon: typeof Briefcase }[]).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-sans text-[14px] font-medium transition-all duration-200"
                style={{
                  backgroundColor: role === value ? "var(--color-ochre)" : "transparent",
                  color: role === value ? "#0D0D0B" : "var(--color-muted)",
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="Chukwudi Nweke"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="h-12 rounded-xl border px-4 font-sans text-[15px] outline-none transition-colors duration-200 w-full"
                style={{ backgroundColor: "var(--color-bg-3)", borderColor: "var(--color-border)", color: "var(--color-cream)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
            </div>

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
                style={{ backgroundColor: "var(--color-bg-3)", borderColor: "var(--color-border)", color: "var(--color-cream)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
            </div>

            {/* Artisan-only fields */}
            <AnimatePresence>
              {role === "artisan" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                        Trade / Skill
                      </label>
                      <CategorySelect
                        required={role === "artisan"}
                        value={form.trade}
                        onChange={(trade) => setForm(f => ({ ...f, trade }))}
                        placeholder="Select trade"
                        className="h-12 rounded-xl border px-0 font-sans text-[15px] outline-none transition-colors duration-200 w-full appearance-none cursor-pointer"
                        style={{ backgroundColor: "var(--color-bg-3)", borderColor: "var(--color-border)", color: form.trade ? "var(--color-cream)" : "var(--color-muted)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                        State
                      </label>
                      <select
                        required={role === "artisan"}
                        value={form.state}
                        onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                        className="h-12 rounded-xl border px-4 font-sans text-[15px] outline-none transition-colors duration-200 w-full appearance-none cursor-pointer"
                        style={{ backgroundColor: "var(--color-bg-3)", borderColor: "var(--color-border)", color: form.state ? "var(--color-cream)" : "var(--color-muted)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--color-ochre)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
                      >
                        <option value="" disabled>Select state</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[13px] font-medium" style={{ color: "var(--color-sand)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="h-12 rounded-xl border px-4 pr-11 font-sans text-[15px] outline-none transition-colors duration-200 w-full"
                  style={{ backgroundColor: "var(--color-bg-3)", borderColor: "var(--color-border)", color: "var(--color-cream)" }}
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

            {/* Terms */}
            <p className="font-sans text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              By creating an account you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--color-ochre)" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "var(--color-ochre)" }}>Privacy Policy</Link>.
            </p>

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
              className="h-12 w-full rounded-full font-sans text-[15px] font-semibold transition-colors duration-200"
              style={{ backgroundColor: "var(--color-ochre)", color: "#0D0D0B", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre-light)"; }}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-ochre)")}
            >
              {loading ? "Creating account…" : `Create ${role === "artisan" ? "artisan " : ""}account`}
            </motion.button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
