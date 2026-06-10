"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_GROUPS } from "@/lib/categories";
import { getGroupEmoji, getTradeEmoji } from "@/lib/category-emojis";
import CategoryEmojiBadge from "@/components/CategoryEmojiBadge";

type Variant = "dark" | "light";

interface PremiumCategoryDropdownProps {
  mode: "groups" | "trades";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variant;
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

const VARIANTS = {
  dark: {
    triggerText: "var(--color-cream)",
    triggerMuted: "#5A5A50",
    triggerBorderFocus: "rgba(200,134,26,0.5)",
    panelBg: "#111110",
    panelBorder: "#2A2A25",
    panelShadow: "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,134,26,0.08)",
    groupHeader: "#5A5A50",
    itemHover: "rgba(200,134,26,0.08)",
    itemActive: "rgba(200,134,26,0.14)",
    itemText: "var(--color-cream)",
    divider: "#1E1E1A",
  },
  light: {
    triggerText: "#0D0D0B",
    triggerMuted: "#5A5A50",
    triggerBorderFocus: "var(--color-ochre)",
    panelBg: "#fff",
    panelBorder: "rgba(13,13,11,0.1)",
    panelShadow: "0 16px 48px rgba(13,13,11,0.12), 0 0 0 1px rgba(200,134,26,0.06)",
    groupHeader: "#5A5A50",
    itemHover: "rgba(200,134,26,0.06)",
    itemActive: "rgba(200,134,26,0.12)",
    itemText: "#0D0D0B",
    divider: "rgba(13,13,11,0.06)",
  },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="shrink-0 transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}
    >
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

export default function PremiumCategoryDropdown({
  mode,
  value,
  onChange,
  placeholder = "Select…",
  allLabel,
  required,
  className = "",
  style,
  variant = "dark",
  onFocus,
  onBlur,
}: PremiumCategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const v = VARIANTS[variant];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const displayLabel =
    mode === "groups"
      ? value || (allLabel ?? placeholder)
      : value || placeholder;

  const hasValue = mode === "groups" ? (allLabel ? value !== "" : !!value) : !!value;

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      style={{
        ...style,
        boxShadow: open ? "0 0 0 3px rgba(200,134,26,0.12)" : style?.boxShadow,
        borderColor: open ? v.triggerBorderFocus : style?.borderColor,
      }}
    >
      <button
        type="button"
        aria-required={required || undefined}
        onClick={() => setOpen((o) => !o)}
        onFocus={(e) => {
          if (rootRef.current) rootRef.current.style.borderColor = v.triggerBorderFocus;
          onFocus?.(e);
        }}
        onBlur={(e) => {
          if (rootRef.current && !open) {
            rootRef.current.style.borderColor = String(style?.borderColor ?? "");
          }
          onBlur?.(e);
        }}
        className="flex h-full w-full min-h-[inherit] items-center gap-3 px-4 text-left outline-none rounded-[inherit] bg-transparent cursor-pointer"
        style={{ color: hasValue ? v.triggerText : v.triggerMuted }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex-1 truncate font-sans text-[15px]">{displayLabel}</span>
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: v.panelBg,
              border: `1px solid ${v.panelBorder}`,
              boxShadow: v.panelShadow,
            }}
          >
            <div
              className="max-h-[min(420px,70vh)] overflow-y-auto overscroll-contain py-2"
              role="listbox"
            >
              {mode === "groups" && allLabel && (
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  onClick={() => pick("")}
                  className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: !value ? v.itemActive : "transparent",
                    color: v.itemText,
                    width: "calc(100% - 16px)",
                  }}
                  onMouseEnter={(e) => {
                    if (value) e.currentTarget.style.backgroundColor = v.itemHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !value ? v.itemActive : "transparent";
                  }}
                >
                  <CategoryEmojiBadge emoji="✦" size="sm" active={!value} theme={variant} />
                  <span className="font-sans text-[14px] font-medium">{allLabel}</span>
                </button>
              )}

              {mode === "groups" &&
                CATEGORY_GROUPS.map((group) => {
                  const active = value === group.label;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(group.label)}
                      className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-colors duration-150 cursor-pointer"
                      style={{
                        backgroundColor: active ? v.itemActive : "transparent",
                        color: v.itemText,
                        width: "calc(100% - 16px)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = v.itemHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = active ? v.itemActive : "transparent";
                      }}
                    >
                      <CategoryEmojiBadge emoji={getGroupEmoji(group.id)} size="sm" active={active} theme={variant} />
                      <span className="font-sans text-[14px] font-medium leading-snug">{group.label}</span>
                    </button>
                  );
                })}

              {mode === "trades" &&
                CATEGORY_GROUPS.map((group, gi) => (
                  <div key={group.id}>
                    {gi > 0 && (
                      <div className="mx-4 my-2 h-px" style={{ backgroundColor: v.divider }} />
                    )}
                    <p
                      className="px-4 pt-2 pb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: v.groupHeader }}
                    >
                      {group.label}
                    </p>
                    {group.trades.map((trade) => {
                      const active = value === trade.label;
                      return (
                        <button
                          key={trade.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => pick(trade.label)}
                          className="flex items-center gap-3 px-3 py-2 mx-2 rounded-xl transition-colors duration-150 cursor-pointer"
                          style={{
                            backgroundColor: active ? v.itemActive : "transparent",
                            color: v.itemText,
                            width: "calc(100% - 16px)",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.backgroundColor = v.itemHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = active ? v.itemActive : "transparent";
                          }}
                        >
                          <CategoryEmojiBadge emoji={getTradeEmoji(trade.id)} size="sm" active={active} theme={variant} />
                          <span className="font-sans text-[14px] leading-snug">{trade.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
