import React from "react";
import { Star } from "lucide-react";

export function FeaturedBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#EFF6FF",
        color: "#2563EB",
        padding: "3px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <Star size={10} fill="#2563EB" style={{ color: "#2563EB" }} /> Featured
    </span>
  );
}

export default FeaturedBadge;
