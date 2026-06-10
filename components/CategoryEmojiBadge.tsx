interface CategoryEmojiBadgeProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
}

const SIZE = {
  sm: { box: "w-7 h-7 text-[13px] rounded-lg", glow: "0 0 8px" },
  md: { box: "w-9 h-9 text-[15px] rounded-xl", glow: "0 0 14px" },
  lg: { box: "w-12 h-12 text-[22px] rounded-2xl", glow: "0 0 20px" },
};

export default function CategoryEmojiBadge({
  emoji,
  size = "md",
  active = false,
  className = "",
}: CategoryEmojiBadgeProps) {
  const s = SIZE[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${s.box} ${className}`}
      style={{
        background: active
          ? "linear-gradient(145deg, rgba(200,134,26,0.22), rgba(200,134,26,0.08))"
          : "linear-gradient(145deg, rgba(200,134,26,0.12), rgba(200,134,26,0.04))",
        border: `1px solid ${active ? "rgba(200,134,26,0.45)" : "rgba(200,134,26,0.18)"}`,
        boxShadow: active
          ? `${s.glow} rgba(200,134,26,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}
