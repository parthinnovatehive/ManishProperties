import type { Stat } from "@/types";
import { ContentIcon } from "@/lib/icons";

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-y border-estate-border bg-white">
      <div className="container-wide grid sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 border-estate-border px-0 py-8 sm:px-6 lg:border-r last:lg:border-r-0"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-estate-blue-pale text-estate-navy">
              <ContentIcon icon={stat.icon} size={20} />
            </div>
            <div>
              <div className="text-[24px] font-extrabold leading-none text-estate-navy">{stat.value}</div>
              <div className="mt-1.5 text-[13px] text-estate-text-sec">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
