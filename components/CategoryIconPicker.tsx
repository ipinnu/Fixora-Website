"use client";

import { useState } from "react";
import { CATEGORY_GROUPS, getGroupById, getTradeLabel } from "@/lib/categories";
import { GROUP_ICONS } from "@/lib/category-icons";
import { getTradeEmoji } from "@/lib/category-emojis";
import CategoryEmojiBadge from "@/components/CategoryEmojiBadge";

interface CategoryIconPickerProps {
  value: string;
  onChange: (tradeId: string) => void;
}

export default function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const activeGroupId = value
    ? CATEGORY_GROUPS.find((g) => g.trades.some((t) => t.id === value))?.id ?? ""
    : "";
  const [expandedGroup, setExpandedGroup] = useState(activeGroupId);

  const handleGroupClick = (groupId: string) => {
    const nextExpanded = expandedGroup === groupId ? "" : groupId;
    setExpandedGroup(nextExpanded);
    const group = getGroupById(groupId);
    if (group?.trades.length === 1) {
      onChange(group.trades[0].id);
    } else if (nextExpanded && !group?.trades.some((t) => t.id === value)) {
      onChange("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CATEGORY_GROUPS.map((group) => {
          const isExpanded = expandedGroup === group.id;
          const hasSelection = group.trades.some((t) => t.id === value);
          const active = isExpanded || hasSelection;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupClick(group.id)}
              className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: active ? "rgba(200,134,26,0.12)" : "#0D0D0B",
                border: `1px solid ${active ? "rgba(200,134,26,0.5)" : "#2A2A25"}`,
                color: active ? "var(--color-ochre)" : "#5A5A50",
              }}
            >
              {GROUP_ICONS[group.id]}
              <span className="font-sans text-[10px] font-medium text-center leading-tight">{group.label}</span>
              {isExpanded && group.trades.length > 1 && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-60">
                  <path d="M2 4l3 3 3-3" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {expandedGroup && getGroupById(expandedGroup) && getGroupById(expandedGroup)!.trades.length > 1 && (
        <div className="rounded-xl p-3" style={{ backgroundColor: "#0D0D0B", border: "1px solid #2A2A25" }}>
          <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A5A50" }}>
            Select specific service
          </label>
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto overscroll-contain">
            {getGroupById(expandedGroup)!.trades.map((trade) => {
              const selected = value === trade.id;
              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => onChange(trade.id)}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: selected ? "rgba(200,134,26,0.14)" : "transparent",
                    border: `1px solid ${selected ? "rgba(200,134,26,0.35)" : "transparent"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = "rgba(200,134,26,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selected ? "rgba(200,134,26,0.14)" : "transparent";
                  }}
                >
                  <CategoryEmojiBadge emoji={getTradeEmoji(trade.id)} size="sm" active={selected} theme="dark" />
                  <span
                    className="font-sans text-[14px] leading-snug"
                    style={{ color: selected ? "var(--color-cream)" : "#8A8A80" }}
                  >
                    {trade.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value && (
        <p className="font-sans text-[12px]" style={{ color: "#5A5A50" }}>
          Selected: <span style={{ color: "var(--color-ochre)" }}>{getTradeLabel(value)}</span>
        </p>
      )}
    </div>
  );
}
