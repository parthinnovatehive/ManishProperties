import { Home, MapPin, Sparkles } from "lucide-react";

type PropertySimilarProps = {
  city?: string | null;
  propertyType?: string | null;
};

export function PropertySimilar({ city, propertyType }: PropertySimilarProps) {
  return (
    <div className="rounded-[20px] border border-estate-border/80 bg-white p-8 shadow-estate">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] border border-estate-border bg-estate-blue-pale">
          <Sparkles className="w-5 h-5 text-estate-navy" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-estate-text">Similar Properties</h3>
          <p className="mt-0.5 text-xs text-estate-muted">Curated recommendations will appear here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Home, label: propertyType || "Premium residence" },
          { icon: MapPin, label: city ? `More listings in ${city}` : "More listings nearby" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-[16px] border border-estate-border bg-estate-bg px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-estate-border bg-white shadow-sm">
                <Icon className="w-4 h-4 text-estate-navy" />
              </span>
              <span className="text-sm font-medium text-estate-text">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
