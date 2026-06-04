import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function Card({ children, interactive = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-estate-border/80 bg-white shadow-estate transition duration-300",
        interactive && "hover:-translate-y-1 hover:border-estate-border-med hover:shadow-estate-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
