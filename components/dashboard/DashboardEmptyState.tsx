import type { ReactNode } from "react";

export default function DashboardEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl px-6 py-12 text-center"
      style={{ backgroundColor: "#111110", border: "1px solid #1E1E1A" }}
    >
      <p className="font-sans text-[15px] font-medium mb-1" style={{ color: "var(--color-cream)" }}>
        {title}
      </p>
      <p className="font-sans text-[13px] leading-relaxed max-w-sm mx-auto" style={{ color: "#5A5A50" }}>
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
