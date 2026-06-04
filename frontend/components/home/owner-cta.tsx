import { CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = ["Free Listing", "Verified Leads", "AI Matching", "Legal Assistance"];

export function OwnerCta() {
  return (
    <section className="bg-estate-navy px-6 py-24 text-center lg:py-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-[#BFE6BF]">For Property Owners</div>
        <h2 className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] leading-tight text-white">
          List Your Property & Reach Lakhs of Verified Buyers
        </h2>
        <p className="mx-auto mb-8 mt-4 max-w-xl text-base leading-7 text-white/70">
          Post your property for free and get connected with genuine buyers and tenants through our AI-powered matching system.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Button href="/submit-property" variant="amber" className="px-7 py-3.5 text-[15px]">
            <Plus size={17} aria-hidden="true" /> List Your Property Free
          </Button>
          <Button href="/auth/login" variant="ghost" className="border-white/30 px-7 py-3.5 text-[15px] text-white hover:bg-white/10">
            Talk to an Expert
          </Button>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-7">
          {features.map((feature) => (
            <span key={feature} className="flex items-center gap-2 text-[13px] text-white/70">
              <CheckCircle size={14} aria-hidden="true" className="text-[#BFE6BF]" />
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
