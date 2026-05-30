import type { Category, Stat } from "@/types";

export const categories: Category[] = [
  { label: "Apartments", icon: "building", count: "24,500+", queryType: "Apartment", surfaceClass: "bg-estate-blue-pale", accentClass: "text-estate-blue", borderClass: "hover:border-estate-blue/30" },
  { label: "Villas", icon: "home", count: "8,200+", queryType: "Villa", surfaceClass: "bg-[#F1F7EF]", accentClass: "text-estate-success", borderClass: "hover:border-estate-success/30" },
  { label: "Plots & Land", icon: "locate", count: "12,800+", surfaceClass: "bg-estate-amber-pale", accentClass: "text-estate-amber", borderClass: "hover:border-estate-amber/30" },
  { label: "Commercial", icon: "landmark", count: "6,400+", queryType: "Commercial", surfaceClass: "bg-[#F4F5F0]", accentClass: "text-estate-navy-mid", borderClass: "hover:border-estate-navy-mid/30" },
  { label: "Penthouses", icon: "sparkles", count: "1,200+", queryType: "Penthouse", surfaceClass: "bg-[#F8F4EF]", accentClass: "text-[#8A6F43]", borderClass: "hover:border-[#8A6F43]/30" },
  { label: "New Projects", icon: "zap", count: "890+", surfaceClass: "bg-[#EEF7F4]", accentClass: "text-[#347D6D]", borderClass: "hover:border-[#347D6D]/30" },
  { label: "PG / Co-living", icon: "users", count: "18,600+", surfaceClass: "bg-[#F7F4EA]", accentClass: "text-[#7A7445]", borderClass: "hover:border-[#7A7445]/30" },
  { label: "Farmhouses", icon: "tree", count: "450+", surfaceClass: "bg-[#ECF5EA]", accentClass: "text-estate-success", borderClass: "hover:border-estate-success/30" },
];

export const homeStats: Stat[] = [
  { value: "2M+", label: "Happy Customers", icon: "users" },
  { value: "85K+", label: "Properties Listed", icon: "building" },
  { value: "42", label: "Cities Covered", icon: "globe" },
  { value: "15 Yrs", label: "Market Experience", icon: "award" },
];
