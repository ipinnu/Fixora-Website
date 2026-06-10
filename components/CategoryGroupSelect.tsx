"use client";

import PremiumCategoryDropdown from "@/components/PremiumCategoryDropdown";

interface CategoryGroupSelectProps {
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: "dark" | "light";
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

/** Grouped category dropdown — compact parent groups with emoji accents */
export default function CategoryGroupSelect({
  value,
  onChange,
  allLabel,
  placeholder = "Select category",
  required,
  className = "",
  style,
  variant = "dark",
  onFocus,
  onBlur,
}: CategoryGroupSelectProps) {
  return (
    <PremiumCategoryDropdown
      mode="groups"
      value={value}
      onChange={onChange}
      allLabel={allLabel}
      placeholder={placeholder}
      required={required}
      variant={variant}
      className={className}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
