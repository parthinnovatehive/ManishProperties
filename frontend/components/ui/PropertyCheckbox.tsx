"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function PropertyCheckbox({
  checked,
  onChange,
  disabled = false,
  className,
  size = "md",
  label,
}: PropertyCheckboxProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center rounded-md border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-estate-navy focus:ring-offset-2",
        checked
          ? "bg-estate-navy border-estate-navy text-white hover:bg-estate-navy-mid"
          : "bg-white border-gray-300 hover:border-estate-navy",
        disabled && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      title={label || (checked ? "Remove from comparison" : "Add to comparison")}
    >
      {checked && <Check size={size === "sm" ? 12 : size === "md" ? 14 : 16} />}
    </button>
  );
}