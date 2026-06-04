import { MapPin } from "lucide-react";

type PropertyHeaderProps = {
  title: string;
  subtitle?: string | null;
  price: string;
  location?: string | null;
  area?: number | null;
  listingType?: string | null;
  propertyType?: string | null;
  possession?: string | null;
  facing?: string | null;
};

function pricePerSqft(price: string, area?: number | null) {
  if (!area) return null;

  const numericPrice = Number.parseInt(String(price).replace(/\D/g, ""), 10);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return (numericPrice / area).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function PropertyHeader({
  title,
  subtitle,
  price,
  location,
  area,
  listingType,
  propertyType,
  possession,
  facing,
}: PropertyHeaderProps) {
  const sqftPrice = pricePerSqft(price, area);
  const badges = [
    listingType ? { label: listingType, className: "bg-estate-blue-pale text-estate-navy" } : null,
    propertyType ? { label: propertyType, className: "bg-[#F1F7EF] text-estate-success" } : null,
    possession ? { label: possession, className: "bg-estate-amber-pale text-estate-amber-dark" } : null,
    facing ? { label: facing, className: "bg-[#EEF7F4] text-[#347D6D]" } : null,
  ].filter((badge): badge is { label: string; className: string } => Boolean(badge));

  return (
    <>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {badges.map((badge) => (
            <span
              key={`${badge.label}-${badge.className}`}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] rounded-md ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-estate-navy md:text-[2.5rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-sm leading-relaxed text-estate-text-sec">{subtitle}</p>}
          {location && (
            <div className="mt-4 flex items-center gap-2 text-estate-muted">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm leading-snug">{location}</span>
            </div>
          )}
        </div>
        <div className="md:text-right flex-shrink-0">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-estate-muted">Asking Price</p>
          <p className="text-4xl font-semibold leading-none tracking-tight text-estate-navy md:text-5xl">{price}</p>
          {sqftPrice && <p className="mt-2 text-xs text-estate-muted">{sqftPrice} / sqft</p>}
        </div>
      </div>
    </>
  );
}
