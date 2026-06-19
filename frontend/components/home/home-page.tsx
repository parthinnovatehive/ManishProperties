"use client";

import { useEffect, useState } from "react";
import { CategoriesSection } from "./categories-section";
import { FeaturedProperties } from "./featured-properties";
import { HeroSearch } from "./hero-search";
import { MarketInsights } from "./market-insights";
import { OwnerCta } from "./owner-cta";
import { StatsBar } from "./stats-bar";
import { TestimonialsSection } from "./testimonials-section";
import { TrendingCities } from "./trending-cities";
import { estateApi } from "@/lib/api";
import type { Category, City, IconKey, Stat, Testimonial, Property } from "@/types";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeStats, setHomeStats] = useState<Stat[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = async () => {
    const featuredProperties = await estateApi.properties.featured();

    console.log("Featured Properties:", featuredProperties);
    setLoading(true);
    setError(null);
    try {
      const [categoryData, cityItems, featuredProperties, testimonialItems, allProperties] = await Promise.all([
        estateApi.content.categories<{ categories: any[]; homeStats: any[] }>(),
        estateApi.content.cities<any>(),
        estateApi.properties.featured(),
        estateApi.content.testimonials<any>(),
        estateApi.properties.list(),
      ]);
      const propertyTypes = [...new Set(allProperties.map((p: any) => p.type).filter(Boolean))] as string[];
      setCategories(propertyTypes.map((type) => {
        const icon: IconKey = type === "Villa" ? "home"
          : type === "Penthouse" ? "landmark"
          : type === "Studio" ? "sparkles"
          : "building";
        return {
          label: type,
          icon,
          count: "",
          queryType: type,
          surfaceClass: "bg-estate-bg",
          accentClass: "text-estate-navy",
          borderClass: "border-estate-border",
        };
      }));
      setHomeStats((categoryData.homeStats || []).map((item) => ({
        value: String(item.value || ""),
        label: item.label || "",
        icon: "home",
      })));
      setCities(cityItems.map((item) => ({
        name: item.name,
        state: item.state || "",
        count: String(item.count || ""),
        img: item.img || item.image || "",
      })));
      setProperties(featuredProperties);
      setTestimonials(
        testimonialItems.slice(0, 3).map((item) => ({
          name: item.name,
          role: item.role,
          city: item.city || "",
          rating: Number(item.rating || 5),
          avatar: item.avatar || item.name?.slice(0, 2).toUpperCase() || "EE",
          text: item.text || item.content || "",
        })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homepage data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);
  console.log("HomePage properties state:", properties);
  return (
    <>
      <HeroSearch />
      {error && (
        <section className="bg-white py-6">
          <div className="container-wide rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
            <button onClick={loadHomeData} className="ml-3 font-bold underline">Retry</button>
          </div>
        </section>
      )}
      {loading && (
        <section className="bg-white py-6">
          <div className="container-wide rounded-2xl border border-estate-border bg-white p-4 text-sm font-semibold text-estate-text-sec">
            Loading latest Manish Properties data...
          </div>
        </section>
      )}
      <StatsBar stats={homeStats} />
      <CategoriesSection categories={categories} />
      <FeaturedProperties properties={properties.slice(0, 3)} />
      <TrendingCities cities={cities} />
      <MarketInsights />
      <TestimonialsSection testimonials={testimonials} />
      <OwnerCta />
    </>
  );
}
