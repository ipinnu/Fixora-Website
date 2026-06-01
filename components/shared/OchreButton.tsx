"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface OchreButtonProps {
  children: ReactNode;
  variant?: "filled" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

export default function OchreButton({
  children,
  variant = "filled",
  href,
  onClick,
  className = "",
  type = "button",
}: OchreButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-[15px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer select-none";

  const styles =
    variant === "filled"
      ? {
          backgroundColor: "var(--color-ochre)",
          color: "#0D0D0B",
          outlineColor: "var(--color-ochre)",
        }
      : {
          border: "1px solid var(--color-border-light)",
          color: "var(--color-cream)",
          outlineColor: "var(--color-ochre)",
        };

  const hoverClass =
    variant === "filled"
      ? "hover:brightness-110"
      : "hover:border-[var(--color-ochre)] hover:text-[var(--color-ochre)]";

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  };

  const combinedClass = `${base} ${hoverClass} ${className}`;

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link href={href} className={combinedClass} style={styles}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      className={combinedClass}
      style={styles}
    >
      {children}
    </motion.button>
  );
}
