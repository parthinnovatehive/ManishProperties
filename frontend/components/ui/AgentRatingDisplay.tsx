"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentRatingDisplayProps {
  rating?: number;
  totalRatings?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export function AgentRatingDisplay({
  rating,
  totalRatings,
  size = 14,
  showCount = true,
  className,
}: AgentRatingDisplayProps) {
  if (rating === undefined || rating === null || (rating === 0 && (!totalRatings || totalRatings === 0))) {
    return (
      <span className={cn("text-xs text-estate-muted", className)}>
        No ratings yet
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex gap-px">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={size}
            className={cn(
              "transition-colors",
              value <= Math.round(rating)
                ? "fill-estate-amber text-estate-amber"
                : "text-gray-300"
            )}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-estate-text ml-0.5">
        {rating.toFixed(1)}
      </span>
      {showCount && totalRatings !== undefined && (
        <span className="text-xs text-estate-muted">
          ({totalRatings})
        </span>
      )}
    </span>
  );
}
