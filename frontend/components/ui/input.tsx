import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: ReactNode;
};

export function Input({ label, icon, required, className, ...props }: InputProps) {
  return (
    <label className="mb-4 block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
          {label}
          {required && <span className="text-estate-red"> *</span>}
        </span>
      )}
      <span className="relative block">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-estate-muted">{icon}</span>}
        <input
          required={required}
          className={cn(
            "focus-field w-full rounded-[14px] border-[1.5px] border-estate-border bg-white py-3 pr-4 text-sm text-estate-text placeholder:text-estate-muted",
            icon ? "pl-9" : "pl-3.5",
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}
