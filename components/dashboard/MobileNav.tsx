"use client";

import { motion } from "framer-motion";

interface NavItem { id: string; label: string; icon: React.ReactNode; }

export default function MobileNav({ items, active, onSelect }: { items: NavItem[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t"
      style={{ backgroundColor: "#0F0E0C", borderColor: "#1E1E1A", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className="flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all duration-200"
              style={{ color: on ? "var(--color-ochre)" : "#5A5A50" }}>
              <div className="relative">
                {on && (
                  <motion.div layoutId="mobile-nav-pill" className="absolute inset-0 rounded-lg -m-1.5"
                    style={{ backgroundColor: "rgba(200,134,26,0.1)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative">{item.icon}</span>
              </div>
              <span className="font-sans text-[9px] font-medium" style={{ color: on ? "var(--color-ochre)" : "#5A5A50" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
