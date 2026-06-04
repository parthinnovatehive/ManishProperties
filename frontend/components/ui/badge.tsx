import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "navy" | "amber" | "success" | "muted" | "white";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
};

const variants: Record<BadgeVariant, string> = {
  blue: "bg-estate-blue-pale text-estate-blue",
  navy: "bg-estate-navy text-white",
  amber: "bg-estate-amber-pale text-estate-amber",
  success: "bg-estate-success-bg text-estate-success",
  muted: "bg-estate-bg text-estate-text-sec",
  white: "bg-white text-estate-navy",
};

export function Badge({ children, variant = "blue", size = "md", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-bold uppercase tracking-[0.04em]",
        variants[variant],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
