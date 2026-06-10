"use client";

import PremiumCategoryDropdown from "@/components/PremiumCategoryDropdown";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: "dark" | "light";
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Select trade",
  required,
  className = "",
  style,
  variant = "dark",
  onFocus,
  onBlur,
}: CategorySelectProps) {
  return (
    <PremiumCategoryDropdown
      mode="trades"
      value={value}
      onChange={onChange}
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
