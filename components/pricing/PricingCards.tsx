"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import OchreButton from "@/components/shared/OchreButton";

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "/mo",
    badge: null,
    featured: false,
    features: ["Profile creation", "Chat access", "Portfolio upload"],
    cta: "Start free",
    ctaVariant: "ghost" as const,
    href: "/signup",
  },
  {
    name: "Pro",
    price: "₦5,000",
    period: "/mo",
    badge: "Most Popular",
    featured: true,
    features: ["Verified badge", "Unlimited bidding", "AI priority matching"],
    cta: "Go Pro",
    ctaVariant: "filled" as const,
    href: "/signup?plan=pro",
  },
  {
    name: "Elite",
    price: "₦15,000",
    period: "/mo",
    badge: null,
    featured: false,
    features: ["Homepage promotion", "Enterprise jobs", "VIP support", "Priority ranking"],
    cta: "Become Elite",
    ctaVariant: "ghost" as const,
    href: "/signup?plan=elite",
  },
];

export default function PricingCards() {
  return (
    <section className="py-16" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-5 lg:items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.featured ? "lg:scale-[1.04] lg:py-10" : ""
              }`}
              style={{
                backgroundColor: plan.featured ? "var(--color-bg-3)" : "var(--color-bg-2)",
                borderColor: plan.featured ? "var(--color-ochre)" : "var(--color-border)",
                borderWidth: plan.featured ? "2px" : "1px",
                boxShadow: plan.featured ? "0 0 60px rgba(200,134,26,0.10)" : "none",
                flex: "1",
                maxWidth: "380px",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span
                    className="rounded-full px-4 py-1 font-sans text-[12px] font-medium"
                    style={{
                      backgroundColor: "var(--color-ochre-dim)",
                      color: "var(--color-ochre-light)",
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className="mb-4 font-sans text-[14px] font-medium uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="mb-6 flex items-end gap-1">
                <span
                  className="font-mono"
                  style={{
                    fontSize: "48px",
                    lineHeight: 1,
                    color: plan.featured ? "var(--color-ochre)" : "var(--color-cream)",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="mb-1 font-sans text-[20px]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="mb-8 flex flex-col gap-3 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={feat}>
                    {j > 0 && (
                      <div
                        className="mb-3 h-px"
                        style={{ backgroundColor: "var(--color-border)" }}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <span
                        className="font-sans text-[14px] font-semibold"
                        style={{ color: "var(--color-green)" }}
                      >
                        ✓
                      </span>
                      <span
                        className="font-sans text-[15px]"
                        style={{ color: "var(--color-sand)" }}
                      >
                        {feat}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <OchreButton variant={plan.ctaVariant} href={plan.href} className="w-full justify-center">
                {plan.cta}
              </OchreButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
