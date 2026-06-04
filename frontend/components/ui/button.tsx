import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "navy" | "amber" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  href?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-estate-navy text-white shadow-estate hover:bg-estate-navy-mid hover:shadow-estate-md",
  navy: "bg-estate-navy text-white shadow-estate hover:bg-estate-navy-mid hover:shadow-estate-md",
  amber: "bg-estate-amber text-estate-navy shadow-estate hover:bg-estate-blue-light hover:text-white hover:shadow-estate-md",
  outline: "border-[1.5px] border-estate-navy bg-transparent text-estate-navy hover:bg-estate-blue-pale hover:shadow-estate",
  ghost: "border-[1.5px] border-estate-border bg-white/70 text-estate-text-sec hover:border-estate-border-med hover:bg-white hover:text-estate-navy",
  danger: "bg-estate-red text-white hover:bg-estate-red/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-xl px-4 py-2.5 text-[13px]",
  md: "gap-1.5 rounded-xl px-6 py-3.5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  href,
  className,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center border-0 font-semibold transition duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
