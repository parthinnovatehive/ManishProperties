import { CheckCircle } from "lucide-react";

type PropertyAmenitiesProps = {
  amenities?: string[] | null;
};

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return <p className="text-sm italic text-estate-muted">Custom amenities detail available upon request.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amenities.map((item) => (
        <div
          key={item}
          className="group flex cursor-default items-center gap-3 rounded-[16px] border border-estate-border bg-estate-bg px-4 py-3.5 transition-all duration-300 hover:border-estate-border-med hover:bg-estate-blue-pale"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-estate-border bg-white shadow-sm transition-all duration-300 group-hover:border-estate-border-med">
            <CheckCircle className="w-3.5 h-3.5 text-estate-navy" />
          </div>
          <span className="text-sm font-medium text-estate-text transition-colors duration-200 group-hover:text-estate-navy">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}
