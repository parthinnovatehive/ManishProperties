"use client";

import { useRouter } from "next/navigation";
import type { City } from "@/types";

export function TrendingCities({ cities }: { cities: City[] }) {
  const router = useRouter();

  return (
    <section className="bg-white py-24 lg:py-28">
      <div className="container-wide">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mb-3 bg-estate-success-bg text-estate-success">Top Locations</div>
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">Trending Cities</h2>
          <p className="mt-2.5 text-[15px] text-estate-text-sec">Explore properties in India&apos;s most sought-after locations</p>
        </div>

        {cities.length === 0 ? (
          <div className="rounded-2xl border border-estate-border bg-estate-bg p-8 text-center text-sm font-semibold text-estate-text-sec">
            No cities are available from the API yet.
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <button
              key={city.name}
              className="group relative h-[230px] overflow-hidden rounded-[20px] text-left shadow-estate transition duration-300 hover:-translate-y-1 hover:shadow-estate-md"
              onClick={() => router.push(`/properties?city=${encodeURIComponent(city.name)}`)}
            >
              <img
                src={city.img}
                alt={city.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                onError={(event) => {
                  event.currentTarget.src = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&auto=format&q=75";
                }}
              />
              <span className="city-overlay absolute inset-0" />
              <span className="absolute bottom-0 left-0 right-0 p-6 pb-5">
                <span className="block text-lg font-bold text-white">{city.name}</span>
                <span className="mt-1 block text-[13px] text-white/75">
                  {city.state} · {city.count} Properties
                </span>
              </span>
              <span className="absolute right-3.5 top-3.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                {city.count}
              </span>
            </button>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
