import { ArrowRight, BarChart3, Calculator, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const insightItems = [
  { label: "Price Trends & Appreciation", icon: TrendingUp },
  { label: "Locality Heatmaps", icon: MapPin },
  { label: "ROI Calculator & Analysis", icon: Calculator },
  { label: "Demand vs Supply Insights", icon: BarChart3 },
];

const rows = [
  { label: "Worli", value: "₹45K-65K/sqft", barClass: "w-[85%]" },
  { label: "Andheri West", value: "₹22K-32K/sqft", barClass: "w-[62%]" },
  { label: "Powai", value: "₹18K-26K/sqft", barClass: "w-[54%]" },
  { label: "Thane West", value: "₹12K-18K/sqft", barClass: "w-[38%]" },
  { label: "Navi Mumbai", value: "₹8K-14K/sqft", barClass: "w-[26%]" },
];

export function MarketInsights() {
  return (
    <section className="bg-estate-bg py-24 lg:py-28">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="section-eyebrow mb-4 bg-estate-blue-pale text-estate-blue">Market Intelligence</div>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight text-estate-navy">
              Make Smarter Real Estate Decisions
            </h2>
            <p className="mb-8 mt-5 text-[15px] leading-8 text-estate-text-sec">
              Access real-time price trends, locality intelligence, and investment insights powered by 10 million+ data points to invest with confidence.
            </p>

            <div className="grid gap-4">
              {insightItems.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-estate-blue-pale text-estate-blue">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-medium text-estate-text">{label}</span>
                </div>
              ))}
            </div>

            <Button href="/properties" className="mt-6">
              Explore Insights <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </div>

          <div className="rounded-[20px] border border-estate-border/80 bg-white p-8 shadow-estate-md">
            <div className="mb-5">
              <div className="mb-1 text-[13px] font-semibold uppercase text-estate-muted">Avg. Price - Mumbai Apartments</div>
              <div className="text-[28px] font-extrabold text-estate-navy">
                ₹18,400 <span className="text-[15px] font-medium text-estate-text-sec">/sq.ft</span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-estate-success-bg px-2.5 py-1 text-[13px] font-bold text-estate-success">
                <TrendingUp size={13} aria-hidden="true" /> +8.3% YoY
              </div>
            </div>

            <div className="grid gap-3.5">
              {rows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex justify-between">
                    <span className="text-[13px] font-medium text-estate-text">{row.label}</span>
                    <span className="text-[13px] text-estate-text-sec">{row.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-estate-border">
                    <div className={`h-full rounded-full bg-gradient-to-r from-estate-navy to-estate-blue-light ${row.barClass}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
