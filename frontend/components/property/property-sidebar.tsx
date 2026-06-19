"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BadgeCheck, Building2, Calendar, Check, Clock, Eye, Mail, Phone, ShieldCheck, TrendingUp, X } from "lucide-react";
import { getAdminData } from "@/lib/utils/token";
import { estateApi } from "@/lib/api";

type PropertySidebarProps = {
  propertyId: string;
  title: string;
  price: string;
  area?: number | null;
  city?: string;
  cityId?: string;
};

const visitDates = ["Today", "Tomorrow", "This Sat", "This Sun"];

function resolveDateLabel(label: string): string {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  let target: Date;

  switch (label) {
    case "Today":
      target = today;
      break;
    case "Tomorrow":
      target = new Date(today);
      target.setUTCDate(target.getUTCDate() + 1);
      break;
    case "This Sat": {
      target = new Date(today);
      const satDelta = (6 - target.getUTCDay() + 7) % 7;
      if (satDelta === 0) target.setUTCDate(target.getUTCDate() + 7);
      else target.setUTCDate(target.getUTCDate() + satDelta);
      break;
    }
    case "This Sun": {
      target = new Date(today);
      const sunDelta = (0 - target.getUTCDay() + 7) % 7;
      if (sunDelta === 0) target.setUTCDate(target.getUTCDate() + 7);
      else target.setUTCDate(target.getUTCDate() + sunDelta);
      break;
    }
    default:
      return label;
  }

  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, "0");
  const d = String(target.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

export function PropertySidebar({ propertyId, title, price, area, city, cityId }: PropertySidebarProps) {
  const [messageSent, setMessageSent] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedType, setSelectedType] = useState("In-Person");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintStatus, setComplaintStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const sqftPrice = pricePerSqft(price, area);
  const shortTitle = title ? `${title.slice(0, 42)}${title.length > 42 ? "..." : ""}` : "this property";

  useEffect(() => {
    if (!cityId) return;
    (async () => {
      try {
        const cities = await estateApi.content.cities<any>();
        const match = cities.find((c: any) => c.id === cityId || c.name === city);
        if (match?.admin_phone) {
          setAdminPhone(match.admin_phone.replace(/\s+/g, ""));
          setAdminName(match.admin_name || "City Admin");
        }
      } catch {
        // silently fail
      }
    })();
  }, [cityId, city]);

  const handleMessage = () => {
    if (!adminPhone) {
      alert("City admin contact not available.");
      return;
    }
    const msg = encodeURIComponent(
      `Hi, I'm interested in "${title}" listed at ${price}. Located in ${city}. Please share more details.`
    );
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, "_blank");
    setMessageSent(true);
    window.setTimeout(() => setMessageSent(false), 3000);
  };

  const handleCall = () => {
    if (!adminPhone) {
      alert("City admin contact not available.");
      return;
    }
    window.open(`tel:${adminPhone}`, "_blank");
  };

  const handleBookVisit = async () => {
    const account = getAdminData();
    if (!account) {
      alert("Please log in to schedule a site visit.");
      window.location.href = `/auth/login?redirect=/properties/${propertyId}`;
      return;
    }

    setBookingStatus("loading");
    try {
      await estateApi.appointments.create({
        propertyId,
        propertyName: title,
        userName: account.name || account.username || "User",
        agentName: "EstateElite Luxe",
        agentEmail: "luxe@estateelite.com",
        date: resolveDateLabel(selectedVisit),
        time: selectedTime,
        type: selectedType,
        status: "Pending",
      });
      setBookingStatus("success");
    } catch (err) {
      console.error("Failed to book site visit:", err);
      setBookingStatus("error");
      window.setTimeout(() => setBookingStatus("idle"), 4000);
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      alert("Please fill in both subject and description.");
      return;
    }
    const account = getAdminData();
    if (!account) {
      alert("Please log in to submit a complaint.");
      window.location.href = `/auth/login?redirect=/properties/${propertyId}`;
      return;
    }

    setComplaintStatus("loading");
    try {
      await estateApi.complaints.create({
        id: `comp_${Date.now()}`,
        propertyId,
        userId: account.id,
        subject: complaintSubject,
        description: complaintDesc,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        resolutionNotes: null,
        actionTaken: null,
      });
      setComplaintStatus("success");
      setComplaintSubject("");
      setComplaintDesc("");
      setTimeout(() => {
        setShowComplaintModal(false);
        setComplaintStatus("idle");
      }, 2000);
    } catch {
      setComplaintStatus("error");
      setTimeout(() => setComplaintStatus("idle"), 4000);
    }
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
                <h3 className="text-white font-semibold text-[15px] leading-tight">Manish Properties Luxe</h3>
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
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 rounded-xl border border-estate-border bg-white px-4 py-3 text-sm font-medium text-estate-text transition-all duration-200 hover:border-estate-border-med hover:bg-estate-bg"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="py-3 px-4 rounded-xl border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Complain
              </button>
            </div>

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
          
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred Date</p>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {visitDates.map((date) => (
              <button
                key={date}
                type="button"
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

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preferred Time</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(t)}
                className={`py-2 px-1 rounded-lg border text-[10px] font-semibold text-center transition-all duration-150 ${
                  selectedTime === t
                    ? "bg-estate-navy border-estate-navy text-white"
                    : "bg-white border-estate-border text-estate-text-sec hover:border-estate-navy hover:bg-estate-blue-pale"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Meeting Type</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {["In-Person", "Video Call"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-all duration-150 ${
                  selectedType === type
                    ? "bg-estate-navy border-estate-navy text-white"
                    : "bg-white border-estate-border text-estate-text-sec hover:border-estate-navy hover:bg-estate-blue-pale"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handleBookVisit}
            disabled={bookingStatus === "loading" || bookingStatus === "success"}
            className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold tracking-wide text-white transition-all duration-200 active:scale-[0.98] ${
              bookingStatus === "success"
                ? "bg-estate-success hover:bg-estate-success text-white"
                : bookingStatus === "error"
                ? "bg-estate-red hover:bg-estate-red text-white"
                : "bg-estate-navy hover:bg-estate-navy-mid text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            {bookingStatus === "loading"
              ? "Booking Tour..."
              : bookingStatus === "success"
              ? "Tour Requested! ✓"
              : bookingStatus === "error"
              ? "Error! Try Again"
              : `Book Site Visit - ${selectedVisit}`}
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

      {showComplaintModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Report a Complaint</h3>
              <button
                onClick={() => { setShowComplaintModal(false); setComplaintStatus("idle"); }}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Incorrect information"
                  className="w-full rounded-xl border border-estate-border px-4 py-2.5 text-sm outline-none focus:border-estate-navy transition"
                  disabled={complaintStatus === "loading" || complaintStatus === "success"}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full rounded-xl border border-estate-border px-4 py-2.5 text-sm outline-none focus:border-estate-navy transition resize-none"
                  disabled={complaintStatus === "loading" || complaintStatus === "success"}
                />
              </div>
              <button
                onClick={handleComplaintSubmit}
                disabled={complaintStatus === "loading" || complaintStatus === "success"}
                className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide text-white transition-all duration-200 active:scale-[0.98] ${
                  complaintStatus === "success"
                    ? "bg-estate-success"
                    : complaintStatus === "error"
                    ? "bg-estate-red"
                    : "bg-estate-navy hover:bg-estate-navy-mid"
                }`}
              >
                {complaintStatus === "loading"
                  ? "Submitting..."
                  : complaintStatus === "success"
                  ? "Complaint Submitted ✓"
                  : complaintStatus === "error"
                  ? "Error! Try Again"
                  : "Submit Complaint"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}