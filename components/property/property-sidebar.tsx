"use client";

import { useState } from "react";
import { BadgeCheck, Building2, Calendar, Check, Clock, Eye, Mail, Phone, ShieldCheck, TrendingUp } from "lucide-react";

type PropertySidebarProps = {
  title: string;
  price: string;
  area?: number | null;
};

const visitDates = ["Today", "Tomorrow", "This Sat", "This Sun"];

function pricePerSqft(price: string, area?: number | null) {
  if (!area) return null;

  const numericPrice = Number.parseInt(String(price).replace(/\D/g, ""), 10);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return (numericPrice / area).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function PropertySidebar({ title, price, area }: PropertySidebarProps) {
  const [messageSent, setMessageSent] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState("Today");
  const sqftPrice = pricePerSqft(price, area);
  const shortTitle = title ? `${title.slice(0, 42)}${title.length > 42 ? "..." : ""}` : "this property";

  const handleMessage = () => {
    setMessageSent(true);
    window.setTimeout(() => setMessageSent(false), 3000);
  };

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-20 space-y-5">
        <div className="overflow-hidden rounded-[20px] border border-estate-border/80 bg-white shadow-estate-lg">
          <div className="bg-gradient-to-br from-estate-navy to-estate-navy-mid px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-xl font-light">
                  EE
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-estate-navy bg-estate-blue-light" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-[15px] leading-tight">EstateElite Luxe</h3>
                <p className="text-white/55 text-xs mt-1 font-light">Senior Property Consultant</p>
                <div className="flex items-center gap-1.5 mt-2.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 w-fit">
                  <BadgeCheck className="w-3 h-3 text-[#BFE6BF]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#BFE6BF]">Certified Advisor</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-5">
              {[
                { val: "4.9", lbl: "Rating" },
                { val: "450+", lbl: "Deals" },
                { val: "< 2h", lbl: "Response" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="text-center bg-white/[0.07] rounded-xl py-3 border border-white/10">
                  <p className="text-sm font-semibold text-white leading-none mb-1">{val}</p>
                  <p className="text-[10px] text-white/40 font-medium">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-3.5">
            <div className="rounded-[16px] border border-estate-border bg-estate-bg px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1">Asking Price</p>
              <p className="text-2xl font-light text-gray-900 tracking-tight">{price}</p>
              {sqftPrice && <p className="text-xs text-gray-400 mt-1 font-light">Est. {sqftPrice} / sqft</p>}
            </div>

            <div className="rounded-[16px] border border-estate-border bg-estate-blue-pale px-4 py-3">
              <p className="text-xs leading-relaxed text-estate-navy">
                Hi, I&apos;m interested in {shortTitle}. Please share more details.
              </p>
            </div>

            <button
              onClick={handleMessage}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                messageSent ? "bg-estate-success hover:bg-estate-success/90 text-white" : "bg-estate-navy hover:bg-estate-navy-mid text-white"
              }`}
            >
              {messageSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              {messageSent ? "Message Sent" : "Send Message"}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-estate-border bg-white px-4 py-3 text-sm font-medium text-estate-text transition-all duration-200 hover:border-estate-border-med hover:bg-estate-bg">
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button className="py-3 px-4 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            <button className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-estate-border bg-white px-6 py-3 text-sm font-medium text-estate-text transition-all duration-200 hover:border-estate-navy hover:bg-estate-bg hover:text-estate-navy">
              <Calendar className="w-4 h-4" />
              Schedule Private Tour
            </button>

            <div className="space-y-2.5 border-t border-estate-border pt-4">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-light">
                <Eye className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>42 highly interested buyers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-light">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>Usually responds within 1 hour</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-estate-border/80 bg-white p-6 shadow-estate">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-estate-border bg-estate-blue-pale">
              <Calendar className="w-4 h-4 text-estate-navy" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Schedule a Site Visit</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-light">Private tour available</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {visitDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedVisit(date)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-200 ${
                  selectedVisit === date
                    ? "bg-estate-navy border-estate-navy text-white shadow-sm"
                    : "bg-white border-estate-border text-estate-text-sec hover:border-estate-navy hover:text-estate-navy hover:bg-estate-blue-pale"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
          <button className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-estate-navy py-3.5 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-estate-navy-mid active:scale-[0.98]">
            <Calendar className="w-4 h-4" />
            Book Site Visit{selectedVisit ? ` - ${selectedVisit}` : ""}
          </button>
        </div>

        <div className="rounded-[20px] border border-estate-border/80 bg-white p-6 shadow-estate">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Why This Property?</h3>
          <div className="space-y-3.5">
            {[
              { icon: ShieldCheck, bold: "RERA & legally verified", rest: "listing" },
              { icon: Building2, bold: "Built by a reputed developer", rest: "" },
              { icon: TrendingUp, bold: "Strong appreciation history", rest: "in this corridor" },
              { icon: Eye, bold: "High demand listing", rest: "- multiple inquiries this week" },
            ].map(({ icon: Icon, bold, rest }) => (
              <div key={bold} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-estate-navy" />
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  <strong className="font-semibold text-gray-800">{bold}</strong>
                  {rest ? ` ${rest}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
