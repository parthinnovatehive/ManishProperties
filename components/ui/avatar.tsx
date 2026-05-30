import { cn } from "@/lib/utils";

type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-[52px] w-[52px] text-lg",
};

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-estate-navy-mid font-bold text-white",
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
