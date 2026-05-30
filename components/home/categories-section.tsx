"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/types";
import { ContentIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const router = useRouter();

  return (
    <section className="bg-white py-24 lg:py-28">
      <div className="container-wide">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mb-3 bg-estate-blue-pale text-estate-blue">Browse by Category</div>
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">What Are You Looking For?</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-estate-text-sec">
            Explore our comprehensive catalogue of property types across India
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.label}
              className={cn(
                "rounded-[20px] border border-transparent p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-estate-md",
                category.surfaceClass,
                category.borderClass,
              )}
              onClick={() => router.push(category.queryType ? `/properties?type=${encodeURIComponent(category.queryType)}` : "/properties")}
            >
              <span className={cn("mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/85 shadow-estate", category.accentClass)}>
                <ContentIcon icon={category.icon} size={22} />
              </span>
              <span className="block text-base font-bold text-estate-text">{category.label}</span>
              <span className={cn("mt-2 block text-xs font-semibold", category.accentClass)}>{category.count} Properties</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
