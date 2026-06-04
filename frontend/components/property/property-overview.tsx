import type { ReactNode } from "react";
import { Bath, BedDouble, Home, Maximize2 } from "lucide-react";

type PropertyOverviewProps = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  propertyType?: string | null;
  furnishing?: string | null;
  listingType?: string | null;
};

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="group flex cursor-default flex-col items-center rounded-[16px] border border-estate-border bg-estate-bg px-3 py-5 text-center transition-all duration-300 hover:border-estate-border-med hover:bg-estate-blue-pale">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] border border-estate-border bg-white shadow-estate transition-all duration-300 group-hover:border-estate-border-med">
        {icon}
      </div>
      <p className="mb-1 text-base font-semibold leading-tight text-estate-text">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-estate-muted">{label}</p>
    </div>
  );
}

export function PropertyOverview({
  bedrooms,
  bathrooms,
  area,
  propertyType,
  furnishing,
  listingType,
}: PropertyOverviewProps) {
  const supplemental = [furnishing, listingType].filter(Boolean).join(" / ");

  const metrics = [
    {
      label: "Bedrooms",
      value: bedrooms ? `${bedrooms} BHK` : "\u2014",
      icon: <BedDouble className="w-5 h-5 text-estate-navy" />,
    },
    {
      label: "Bathrooms",
      value: bathrooms ? String(bathrooms) : "\u2014",
      icon: <Bath className="w-5 h-5 text-estate-navy" />,
    },
    {
      label: "Interior Space",
      value: area ? `${area} sqft` : "\u2014",
      icon: <Maximize2 className="w-5 h-5 text-estate-navy" />,
    },
    {
      label: "Residence Type",
      value: propertyType || "Estate",
      icon: <Home className="w-5 h-5 text-estate-navy" />,
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-estate-border pt-7 sm:grid-cols-4">
      {supplemental && <span className="sr-only">{supplemental}</span>}
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
