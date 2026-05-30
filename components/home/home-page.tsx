import { categories, homeStats } from "@/data/categories";
import { cities } from "@/data/cities";
import { properties } from "@/data/properties";
import { testimonials } from "@/data/testimonials";
import { CategoriesSection } from "./categories-section";
import { FeaturedProperties } from "./featured-properties";
import { HeroSearch } from "./hero-search";
import { MarketInsights } from "./market-insights";
import { OwnerCta } from "./owner-cta";
import { StatsBar } from "./stats-bar";
import { TestimonialsSection } from "./testimonials-section";
import { TrendingCities } from "./trending-cities";

export function HomePage() {
  return (
    <>
      <HeroSearch />
      <StatsBar stats={homeStats} />
      <CategoriesSection categories={categories} />
      <FeaturedProperties properties={properties.filter((property) => property.featured).slice(0, 3)} />
      <TrendingCities cities={cities} />
      <MarketInsights />
      <TestimonialsSection testimonials={testimonials} />
      <OwnerCta />
    </>
  );
}
