"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Calculator, Camera, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, LocateFixed, MapPin, Maximize2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmitForm = {
  listingType: string;
  propertyType: string;
  bedrooms: string;
  title: string;
  description: string;
  price: string;
  area: string;
  address: string;
  city: string;
  pincode: string;
  amenities: string[];
  furnishing: string;
  files: File[];
};

const totalSteps = 4;
const amenityOptions = [
  "Swimming Pool",
  "Gymnasium",
  "24/7 Security",
  "Covered Parking",
  "Power Backup",
  "Clubhouse",
  "Kids Zone",
  "Garden",
  "Elevator",
  "CCTV",
  "Intercom",
  "Gas Pipeline",
];

const stepItems = [
  { label: "Property Type", icon: Building2 },
  { label: "Location", icon: MapPin },
  { label: "Details & Price", icon: Calculator },
  { label: "Photos", icon: Camera },
];

export function SubmitPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SubmitForm>({
    listingType: "Sell",
    propertyType: "Apartment",
    bedrooms: "3",
    title: "",
    description: "",
    price: "",
    area: "",
    address: "",
    city: "",
    pincode: "",
    amenities: [],
    furnishing: "Semi-Furnished",
    files: [],
  });

  const update = <K extends keyof SubmitForm>(key: K, value: SubmitForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const toggleAmenity = (amenity: string) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.title.trim()) {
      setError("Please enter a property title");
      return;
    }

    if (!form.city) {
      setError("Please select a city");
      return;
    }

    if (!form.price) {
      setError("Please enter the price");
      return;
    }

    if (!form.area) {
      setError("Please enter the area");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      alert("✓ Property submitted successfully! It has been queued for Admin approval.");
      router.push("/properties");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-estate-bg px-6 py-10">
      <div className="mx-auto max-w-[840px]">
        <div className="mb-9 text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-xl bg-estate-navy px-5 py-2.5 text-white">
            <Building2 size={18} aria-hidden="true" />
            <span className="font-bold">List Your Property - Free</span>
          </div>
          <h1 className="mb-2.5 font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">Reach Lakhs of Verified Buyers</h1>
          <p className="text-[15px] text-estate-text-sec">Fill in the details below to list your property and start receiving genuine inquiries</p>
        </div>

        <div className="mb-9 flex items-center rounded-[14px] border border-estate-border bg-white px-6 py-4">
          {stepItems.map(({ label, icon: Icon }, index) => {
            const stepNumber = index + 1;
            const done = stepNumber < step;
            const active = stepNumber === step;
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 text-sm font-bold transition",
                      done && "border-estate-success bg-estate-success text-white",
                      active && "border-estate-navy bg-estate-navy text-white",
                      !done && !active && "border-estate-border bg-estate-bg text-estate-muted",
                    )}
                  >
                    {done ? <Check size={18} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                  </div>
                  <span className={cn("whitespace-nowrap text-[11px] font-semibold", stepNumber <= step ? "text-estate-navy" : "text-estate-muted")}>
                    {label}
                  </span>
                </div>
                {index < stepItems.length - 1 && (
                  <div className={cn("mx-2 mb-4 h-0.5 flex-1 transition", done ? "bg-estate-success" : "bg-estate-border")} />
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-5 rounded-[20px] border border-estate-border bg-white p-6 sm:p-9">
          {error && (
            <div className="mb-6 rounded-[9px] bg-red-50 p-3.5 text-sm font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">What are you listing?</h2>
              <p className="mb-7 text-sm text-estate-text-sec">Tell us about the nature of your property listing</p>

              <ChoiceGroup
                title="I want to"
                values={["Sell", "Rent", "PG"]}
                active={form.listingType}
                onSelect={(value) => update("listingType", value)}
                columns="grid-cols-3"
                strong
              />

              <ChoiceGroup
                title="Property Type"
                values={["Apartment", "Villa", "Plot", "Commercial", "Penthouse", "Studio", "Row House", "Farmhouse"]}
                active={form.propertyType}
                onSelect={(value) => update("propertyType", value)}
                columns="grid-cols-2 sm:grid-cols-4"
              />

              {["Apartment", "Villa", "Studio", "Row House"].includes(form.propertyType) && (
                <ChoiceGroup
                  title="Bedrooms"
                  values={["1", "2", "3", "4", "5", "6+"]}
                  active={form.bedrooms}
                  onSelect={(value) => update("bedrooms", value)}
                  columns="grid-cols-6"
                  navy
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">Where is your property?</h2>
              <p className="mb-7 text-sm text-estate-text-sec">Accurate location details help buyers find your property</p>

              <Input label="Full Address" placeholder="House/Flat no., Building name, Street" value={form.address} onChange={(event) => update("address", event.target.value)} icon={<MapPin size={15} />} required disabled={loading} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                    City <span className="text-estate-red">*</span>
                  </span>
                  <span className="relative block">
                    <select
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                      className={cn(
                        "focus-field w-full appearance-none rounded-lg border-[1.5px] border-estate-border bg-white py-2.5 pl-3.5 pr-8 text-sm",
                        form.city ? "text-estate-text" : "text-estate-muted",
                      )}
                      disabled={loading}
                    >
                      <option value="">Select City</option>
                      {["Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"].map((city) => (
                        <option key={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-estate-muted" />
                  </span>
                </label>
                <Input label="Pincode" placeholder="400 001" value={form.pincode} onChange={(event) => update("pincode", event.target.value)} required disabled={loading} />
              </div>

              <div className="mt-2 flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-estate-border-med bg-estate-bg transition hover:bg-estate-blue-pale">
                <MapPin size={32} aria-hidden="true" className="mb-2.5 text-estate-blue" />
                <div className="mb-1 text-[15px] font-semibold text-estate-navy">Pin Location on Map</div>
                <div className="text-[13px] text-estate-muted">Click to open map and select exact location</div>
                <div className="mt-3.5 flex gap-2">
                  <Button size="sm" disabled={loading}>
                    <LocateFixed size={14} aria-hidden="true" /> Use My Location
                  </Button>
                  <Button variant="ghost" size="sm" disabled={loading}>
                    Open Map
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">Property Details & Pricing</h2>
              <p className="mb-7 text-sm text-estate-text-sec">Add accurate details to attract the right buyers</p>

              <Input label="Property Title" placeholder="e.g. Spacious 3BHK with Sea View in Worli" value={form.title} onChange={(event) => update("title", event.target.value)} required disabled={loading} />
              <label className="mb-4 block">
                <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Description</span>
                <textarea
                  placeholder="Describe the property - key features, surroundings, unique advantages..."
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  rows={4}
                  className="focus-field w-full resize-y rounded-lg border-[1.5px] border-estate-border px-3.5 py-2.5 text-sm leading-6 text-estate-text"
                  disabled={loading}
                />
              </label>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                    Price / Rent <span className="text-estate-red">*</span>
                  </span>
                  <span className="relative block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-estate-text-sec">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 8500000"
                      value={form.price}
                      onChange={(event) => update("price", event.target.value)}
                      className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 pl-7 pr-3.5 text-sm text-estate-text"
                      disabled={loading}
                    />
                  </span>
                </label>
                <Input label="Carpet Area (sq.ft)" placeholder="e.g. 1200" value={form.area} onChange={(event) => update("area", event.target.value)} icon={<Maximize2 size={15} />} required disabled={loading} />
              </div>

              <ChoiceGroup
                title="Furnishing Status"
                values={["Unfurnished", "Semi-Furnished", "Fully Furnished"]}
                active={form.furnishing}
                onSelect={(value) => update("furnishing", value)}
                columns="grid-cols-3"
              />

              <div>
                <div className="mb-3 text-[13px] font-bold uppercase text-estate-text">Amenities</div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {amenityOptions.map((amenity) => {
                    const selected = form.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        className={cn(
                          "flex items-center gap-2 rounded-[9px] border-[1.5px] px-3 py-2.5 text-left transition",
                          selected ? "border-estate-blue bg-estate-blue-pale" : "border-estate-border bg-white",
                        )}
                        onClick={() => toggleAmenity(amenity)}
                        disabled={loading}
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2",
                            selected ? "border-estate-blue bg-estate-blue text-white" : "border-estate-border bg-white",
                          )}
                        >
                          {selected && <Check size={12} aria-hidden="true" />}
                        </span>
                        <span className="text-xs font-medium text-estate-text">{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">Add Photos & Finalize</h2>
              <p className="mb-7 text-sm text-estate-text-sec">Properties with 8+ photos get 3x more inquiries</p>

              <div className="mb-6 cursor-pointer rounded-2xl border-2 border-dashed border-estate-blue/40 bg-[#F8FBFF] p-10 text-center transition hover:border-estate-blue hover:bg-estate-blue-pale">
                <div className="mx-auto mb-3.5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-estate-blue-pale text-estate-blue">
                  <Upload size={26} aria-hidden="true" />
                </div>
                <div className="mb-1.5 text-base font-bold text-estate-navy">Drag & Drop Photos Here</div>
                <div className="mb-4 text-sm text-estate-text-sec">or click to browse from your device</div>
                <Button variant="outline" size="sm" disabled={loading}>
                  <Camera size={14} aria-hidden="true" /> Select Photos
                </Button>
                <div className="mt-3 text-xs text-estate-muted">Supports JPG, PNG, HEIF up to 10MB each · Minimum 3 photos required</div>
              </div>

              <div className="mb-6 rounded-xl bg-estate-amber-pale p-[18px]">
                <div className="mb-2.5 text-[13px] font-bold text-estate-amber-dark">Tips for Great Photos</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {["Shoot in daylight for best results", "Capture all rooms including kitchen", "Include building exterior", "Show parking and amenities"].map((tip) => (
                    <div key={tip} className="flex items-center gap-2 text-[13px] text-estate-text-sec">
                      <CheckCircle size={13} aria-hidden="true" className="shrink-0 text-estate-amber" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] bg-estate-bg p-5">
                <div className="mb-3.5 text-sm font-bold text-estate-navy">Listing Summary</div>
                {[
                  ["Listing Type", form.listingType || "Not set"],
                  ["Property Type", `${form.bedrooms ? `${form.bedrooms} BHK ` : ""}${form.propertyType}`],
                  ["Location", form.city ? `${form.address || "-"}, ${form.city}` : "Not set"],
                  ["Price", form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "Not set"],
                ].map(([label, value]) => (
                  <div key={label} className="mb-2.5 flex justify-between gap-4 text-sm last:mb-0">
                    <span className="text-estate-muted">{label}</span>
                    <span className="text-right font-semibold text-estate-text">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-estate-border bg-white px-5 py-3 text-sm font-semibold text-estate-text-sec disabled:opacity-50"
            onClick={() => (step > 1 ? setStep((value) => value - 1) : router.push("/"))}
            disabled={loading}
          >
            <ChevronLeft size={16} aria-hidden="true" /> {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-[13px] text-estate-muted">
              Step {step} of {totalSteps}
            </span>
            {[1, 2, 3, 4].map((item) => (
              <span key={item} className={cn("h-1.5 rounded-full transition-all", item <= step ? "w-6 bg-estate-navy" : "w-2.5 bg-estate-border")} />
            ))}
          </div>
          <Button
            type="button"
            variant={step === totalSteps ? "amber" : "navy"}
            onClick={() => {
              if (step < totalSteps) {
                setStep((value) => value + 1);
                return;
              }

              handleSubmit();
            }}
            disabled={loading}
          >
            {loading ? (
              <>Submitting...</>
            ) : step === totalSteps ? (
              <>
                <CheckCircle size={16} aria-hidden="true" /> Submit Listing
              </>
            ) : (
              <>
                Next <ChevronRight size={16} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


function ChoiceGroup({
  title,
  values,
  active,
  onSelect,
  columns,
  strong,
  navy,
}: {
  title: string;
  values: string[];
  active: string;
  onSelect: (value: string) => void;
  columns: string;
  strong?: boolean;
  navy?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-estate-text">{title}</div>
      <div className={`grid gap-2.5 ${columns}`}>
        {values.map((value) => {
          const selected = active === value;
          return (
            <button
              key={value}
              className={cn(
                "rounded-[10px] border-[1.5px] px-2 py-2.5 text-sm font-semibold transition",
                strong && "py-3.5 text-[15px] font-bold",
                selected
                  ? navy
                    ? "border-estate-navy bg-estate-blue-pale text-estate-navy"
                    : "border-estate-blue bg-estate-blue-pale text-estate-blue"
                  : "border-estate-border bg-white text-estate-text-sec",
              )}
              onClick={() => onSelect(value)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
