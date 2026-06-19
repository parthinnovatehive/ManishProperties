import { ArrowRight } from "lucide-react";
import type { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  console.log("FeaturedProperties received:", properties);
console.log("Count:", properties.length);
  return (
    <section className="bg-estate-bg py-24 lg:py-28">
      <div className="container-wide">
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-eyebrow mb-3 bg-estate-amber-pale text-estate-amber-dark">Featured</div>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">Premium Properties</h2>
            <p className="mt-1.5 text-[15px] text-estate-text-sec">Handpicked luxury listings verified by our experts</p>
          </div>
          <Button href="/properties" variant="outline">
            View All <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-estate-border bg-white p-8 text-center text-sm font-semibold text-estate-text-sec">
            No featured properties are available from the API yet.
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
