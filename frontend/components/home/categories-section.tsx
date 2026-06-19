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

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-estate-border bg-estate-bg p-8 text-center text-sm font-semibold text-estate-text-sec">
            No categories are available from the API yet.
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, idx) => {
            const gradients = [
              "from-emerald-50 to-teal-50",
              "from-blue-50 to-indigo-50",
              "from-amber-50 to-orange-50",
              "from-purple-50 to-pink-50",
              "from-rose-50 to-red-50",
              "from-cyan-50 to-sky-50",
            ];
            const grad = gradients[idx % gradients.length];
            return (
              <button
                key={category.label}
                className={cn(
                  "group rounded-[20px] border border-estate-border/60 bg-gradient-to-br p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-estate-md",
                  grad,
                )}
                onClick={() => router.push(category.queryType ? `/properties?type=${encodeURIComponent(category.queryType)}` : "/properties")}
              >
                <span className={cn(
                  "mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-110",
                  category.accentClass,
                )}>
                  <ContentIcon icon={category.icon} size={24} />
                </span>
                <span className="block text-lg font-bold text-estate-text">{category.label}</span>
                <span className="mt-1.5 block text-sm font-medium text-estate-muted group-hover:text-estate-text-sec">
                  Browse {category.label}s &rarr;
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
