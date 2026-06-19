"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  maxStars?: number;
  disabled?: boolean;
  showValue?: boolean;
}

export function StarRating({
  rating,
  onRate,
  size = 24,
  maxStars = 5,
  disabled = false,
  showValue = false,
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const displayRating = hoveredStar || rating;

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Rating">
      <div className="flex items-center" role="radiogroup" aria-label="Star rating">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= Math.round(displayRating);

          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              aria-checked={starValue <= Math.round(rating)}
              role="radio"
              onClick={() => onRate?.(starValue)}
              onMouseEnter={() => !disabled && setHoveredStar(starValue)}
              onMouseLeave={() => !disabled && setHoveredStar(0)}
              className={cn(
                "transition-all duration-150",
                disabled
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110 active:scale-95",
                filled ? "text-estate-amber" : "text-gray-300"
              )}
            >
              <Star
                size={size}
                className={cn(
                  "transition-all duration-150",
                  filled ? "fill-estate-amber" : "fill-transparent"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-estate-text ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
