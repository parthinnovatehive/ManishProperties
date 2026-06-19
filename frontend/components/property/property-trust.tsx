import { ShieldCheck, TrendingUp } from "lucide-react";

type PropertyTrustProps = {
  rera?: string | null;
  responseRate?: string;
};

export function PropertyTrust({ rera, responseRate = "< 2h" }: PropertyTrustProps) {
  return (
    <>
      <div className="rounded-[20px] bg-gradient-to-br from-estate-navy via-estate-navy-mid to-[#0F3A29] p-8 text-white shadow-estate">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">Manish Properties Verified Listing</h3>
            <p className="text-[11px] text-white/50 mt-1 font-light leading-relaxed">
              {"Legally audited \u00b7 RERA compliant \u00b7 Fraud-protected transaction"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { value: "450+", label: "Verified Deals" },
            { value: rera || "RERA", label: "Registered" },
            { value: responseRate, label: "Avg. Response" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-white/[0.07] rounded-xl py-4 border border-white/10">
              <p className="mb-1 text-2xl font-semibold tracking-tight text-[#BFE6BF]">{value}</p>
              <p className="text-[10px] text-white/45 uppercase tracking-[0.08em] font-semibold">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/35 font-light leading-relaxed">
          Title deeds, structural integrity, and legal clearances have been comprehensively audited by Manish Properties Legal. All transactions are secured with full documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="group rounded-[20px] border border-estate-border bg-white p-6 shadow-estate transition-shadow duration-300 hover:shadow-estate-md">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] border border-estate-border bg-estate-blue-pale">
            <TrendingUp className="w-5 h-5 text-estate-navy" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-estate-text">High Appreciation Area</h3>
          <p className="text-sm leading-relaxed text-estate-text-sec">
            Historical data indicates consistent year-over-year property value increase in this precise neighbourhood corridor.
          </p>
        </div>
        <div className="rounded-[20px] bg-gradient-to-br from-estate-navy to-estate-navy-mid p-6 text-white transition-shadow duration-300 hover:shadow-estate-lg">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/15 bg-white/10">
            <ShieldCheck className="w-5 h-5 text-[#BFE6BF]" />
          </div>
          <h3 className="text-base font-semibold mb-2">Verified Authenticity</h3>
          <p className="text-sm leading-relaxed text-white/75">
            Title deeds, structural integrity, and legal clearances have been comprehensively audited by Manish Properties Legal.
          </p>
        </div>
      </div>
    </>
  );
}
