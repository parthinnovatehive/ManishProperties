"use client";

export function PropertyNearby({
  amenities,
}: {
  amenities: any[];
}) {
  return (
    <section className="rounded-[20px] border border-estate-border bg-white p-8 shadow-estate">
      <h2 className="mb-6 text-2xl font-bold text-estate-navy">
        Nearby Amenities
      </h2>

      <div className="space-y-4">
        {amenities.slice(0, 8).map((item, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            <div className="font-semibold">
              {item.tags?.name || "Unnamed"}
            </div>

            <div className="text-sm text-gray-500">
              {item.tags?.amenity ||
                item.tags?.shop ||
                item.tags?.railway}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}