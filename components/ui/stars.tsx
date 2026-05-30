import { Star } from "lucide-react";

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          size={size}
          className={value <= Math.round(rating) ? "fill-estate-amber text-estate-amber" : "text-estate-muted"}
        />
      ))}
    </span>
  );
}
