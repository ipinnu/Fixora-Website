interface CategoryEmojiBadgeProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
  theme?: "dark" | "light";
}

const SIZE = {
  sm: { box: "w-7 h-7 text-[13px] rounded-lg" },
  md: { box: "w-9 h-9 text-[15px] rounded-xl" },
  lg: { box: "w-12 h-12 text-[22px] rounded-2xl" },
};

const THEME = {
  dark: {
    bg: { idle: "rgba(255,255,255,0.03)", active: "rgba(255,255,255,0.06)" },
    border: { idle: "#2A2A25", active: "rgba(200,134,26,0.35)" },
    emojiOpacity: { idle: 0.5, active: 0.72 },
    emojiFilter: "grayscale(1) saturate(0) brightness(1.05)",
  },
  light: {
    bg: { idle: "rgba(13,13,11,0.04)", active: "rgba(200,134,26,0.08)" },
    border: { idle: "rgba(13,13,11,0.1)", active: "rgba(200,134,26,0.35)" },
    emojiOpacity: { idle: 0.45, active: 0.65 },
    emojiFilter: "grayscale(1) saturate(0) brightness(0.75)",
  },
};

export default function CategoryEmojiBadge({
  emoji,
  size = "md",
  active = false,
  className = "",
  theme = "dark",
}: CategoryEmojiBadgeProps) {
  const s = SIZE[size];
  const t = THEME[theme];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${s.box} ${className}`}
      style={{
        backgroundColor: active ? t.bg.active : t.bg.idle,
        border: `1px solid ${active ? t.border.active : t.border.idle}`,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          filter: t.emojiFilter,
          opacity: active ? t.emojiOpacity.active : t.emojiOpacity.idle,
          lineHeight: 1,
        }}
      >
        {emoji}
      </span>
    </span>
  );
}
