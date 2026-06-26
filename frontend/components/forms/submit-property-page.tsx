"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calculator,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  MapPin,
  Maximize2,
  Upload,
  X,
  Loader2,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { geocodeProperty } from "@/lib/geocode-property";
import { generateNearbyAmenities } from "@/lib/generateNearbyAmenities";
import { State } from "country-state-city";
import { City } from "country-state-city";
import { toast } from "sonner";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";
import { estateApi } from "@/lib/api";
import { MapPicker } from "@/components/ui/MapPicker";

const states = State.getStatesOfCountry("IN");

type SubmitForm = {
  category: string;
  listingType: string;
  propertyType: string;
  bedrooms: string;
  officeType: string;
  pantry: string;
  washrooms: string;
  powerBackup: string;
  cabinCount: string;
  conferenceRoom: string;
  title: string;
  description: string;
  price: string;
  area: string;
  address: string;
  city: string;
  city_id: string;
  sub_area_id: string;
  pincode: string;
  amenities: string[];
  furnishing: string;
  files: File[];
  state: string;
};

const totalSteps = 5;
const residentialTypes = ["Apartment", "Villa", "Plot", "Penthouse", "Studio", "Row House", "Farmhouse"];
const commercialTypes = ["Commercial", "Office", "Retail Space", "Warehouse", "Showroom", "Industrial", "Coworking", "Commercial Plot"];

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
  { label: "Featured", icon: Star },
];

interface UploadedImage {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
}

export function SubmitPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<any>(null);
  const { user } = useAuth();
  const [nearbyAmenities, setNearbyAmenities] = useState<any>(null);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [subareasList, setSubareasList] = useState<any[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Featured states
  const [featuredPlans, setFeaturedPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [featuredOption, setFeaturedOption] = useState<"none" | "plan">("none");
  const [paymentProof, setPaymentProof] = useState<UploadedImage | null>(null);
  const [uploadingPaymentProof, setUploadingPaymentProof] = useState(false);
  const [qrImage, setQrImage] = useState<string>("");

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoords({ lat, lng });
    update("address", address);
    toast.success("Location selected successfully!");
  };

  const handleUseCurrentLocation = () => {
    setIsMapOpen(true);
  };
  
  const [form, setForm] = useState<SubmitForm>({
    category: "",
    listingType: "Sell",
    propertyType: "Apartment",
    bedrooms: "3",
    officeType: "",
    pantry: "no",
    washrooms: "1",
    powerBackup: "no",
    cabinCount: "0",
    conferenceRoom: "no",
    title: "",
    description: "",
    state: "",
    city_id: "",
    sub_area_id: "",
    price: "",
    area: "",
    address: "",
    city: "",
    pincode: "",
    amenities: [],
    furnishing: "Semi-Furnished",
    files: [],
  });

  const selectedState = states.find((s) => s.name === form.state);
  const filteredCities = selectedState
    ? City.getCitiesOfState("IN", selectedState.isoCode).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    : [];

  // Fetch cities and subareas from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [citiesData, subareasData] = await Promise.all([
          estateApi.cities.list(),
          estateApi.content.subareas.list()
        ]);
        setCitiesList(citiesData || []);
        setSubareasList(subareasData || []);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch featured plans
  useEffect(() => {
    const fetchFeaturedPlans = async () => {
      try {
        const response = await apiClient.get('/api/content/featured-plans');
        if (response.success) {
          setFeaturedPlans(response.plans || []);
        }
      } catch (error) {
        console.error("Failed to fetch featured plans:", error);
      }
    };
    fetchFeaturedPlans();
    
    // Set QR image - you can replace this with your actual QR code URL
    setQrImage("/images/qr-code.png");
  }, []);

  // Upload payment proof image
  const uploadPaymentProof = useCallback(async (file: File) => {
    setUploadingPaymentProof(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await apiClient.post('/api/properties/upload-images?category=payment_proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const images = response.data?.images || response.images;
      if (response.success && images && images.length > 0) {
        const img = images[0];
        setPaymentProof({
          url: img.url,
          public_id: img.public_id,
          width: img.width,
          height: img.height,
        });
        toast.success("Payment proof uploaded successfully!");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Failed to upload payment proof");
    } finally {
      setUploadingPaymentProof(false);
    }
  }, []);

  // ✅ Upload images to Cloudinary via backend
  const uploadImages = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);

    if (uploadedImages.length + fileArray.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);

    const formData = new FormData();
    fileArray.forEach(file => {
      formData.append('images', file);
    });

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.post('/api/properties/upload-images?category=property', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const images = response.data?.images || response.images;
      const uploaded = response.data?.uploaded ?? response.uploaded ?? 0;
      if (response.success && images && images.length > 0) {
        const newImages = images.map((img: any) => ({
          url: img.url,
          public_id: img.public_id,
          width: img.width,
          height: img.height,
        }));
        setUploadedImages(prev => [...prev, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully!`);
      } else {
        toast.error(response.data?.message || response.message || `Uploaded ${uploaded} image(s), but no image data returned`);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || "Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadedImages.length]);

  // ✅ Remove image from Cloudinary
  const removeImage = useCallback(async (index: number) => {
    const imageToRemove = uploadedImages[index];

    try {
      if (imageToRemove.public_id) {
        await apiClient.delete(`/api/properties/delete-image?public_id=${imageToRemove.public_id}`);
      }

      setUploadedImages(prev => prev.filter((_, i) => i !== index));
      toast.success("Image removed");
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error("Failed to delete image");
    }
  }, [uploadedImages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadImages(files);
    }
  };

  const previewAmenities = async () => {
    if (!form.address || !form.city) return;

    try {
      setLoadingAmenities(true);

      const result = await geocodeProperty(
        `${form.address}, ${form.city}, ${form.state}, ${form.pincode}, India`,
        ""
      );

      if (!result) return;

      setCoords(result);

      const amenities = await generateNearbyAmenities(result.lat, result.lng);
      setNearbyAmenities(amenities);
      toast.success("Nearby amenities fetched successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch amenities");
    } finally {
      setLoadingAmenities(false);
    }
  };

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

  // ✅ Step validation - validates current step and shows errors
  const validateStep = (stepNumber: number): boolean => {
    setError(null);

    switch (stepNumber) {
      case 1: // Category + Property Type
        if (!form.category) {
          setError("Please select a property category (Residential or Commercial)");
          toast.error("Please select a property category");
          return false;
        }
        if (!form.listingType) {
          setError("Please select a listing type (Sell, Rent, or PG)");
          toast.error("Please select a listing type");
          return false;
        }
        if (!form.propertyType) {
          setError("Please select a property type");
          toast.error("Please select a property type");
          return false;
        }
        if (form.category === "residential" && !form.bedrooms) {
          setError("Please select number of bedrooms");
          toast.error("Please select number of bedrooms");
          return false;
        }
        if (form.category === "commercial" && !form.officeType) {
          setError("Please select an office/space type");
          toast.error("Please select an office/space type");
          return false;
        }
        return true;

      case 2: // Location
        if (!form.address.trim()) {
          setError("Please enter the property address");
          toast.error("Please enter the property address");
          return false;
        }
        if (!form.state) {
          setError("Please select a state");
          toast.error("Please select a state");
          return false;
        }
        if (!form.city_id) {
          setError("Please select a city");
          toast.error("Please select a city");
          return false;
        }
        if (!form.pincode.trim()) {
          setError("Please enter pincode");
          toast.error("Please enter pincode");
          return false;
        }
        if (!/^\d{6}$/.test(form.pincode)) {
          setError("Enter a valid 6-digit pincode");
          toast.error("Enter a valid 6-digit pincode");
          return false;
        }
        return true;

      case 3: // Details & Pricing
        if (!form.title.trim()) {
          setError("Please enter a property title");
          toast.error("Please enter a property title");
          return false;
        }
        if (!form.description.trim()) {
          setError("Please enter a property description");
          toast.error("Please enter a property description");
          return false;
        }
        if (!form.price) {
          setError("Please enter the price");
          toast.error("Please enter the price");
          return false;
        }
        if (Number(form.price) <= 0) {
          setError("Please enter a valid price");
          toast.error("Please enter a valid price");
          return false;
        }
        if (!form.area) {
          setError("Please enter the area");
          toast.error("Please enter the area");
          return false;
        }
        if (Number(form.area) <= 0) {
          setError("Please enter a valid area");
          toast.error("Please enter a valid area");
          return false;
        }
        return true;

      case 4: // Photos
        if (uploadedImages.length < 3) {
          // setError(`Please upload at least 3 images (${uploadedImages.length}/3 uploaded)`);
          // toast.error(`Please upload at least 3 images (${uploadedImages.length}/3 uploaded)`);
          // return false;
        }
        return true;

      case 5: // Featured
        if (featuredOption === "plan" && !selectedPlan) {
          setError("Please select a featured plan");
          toast.error("Please select a featured plan");
          return false;
        }
        if (featuredOption === "plan" && !paymentProof) {
          setError("Please upload payment proof");
          toast.error("Please upload payment proof");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // ✅ Handle Next button click - validates current step before proceeding
  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  // ✅ Handle Back button click
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async () => {
    // ✅ Validate all steps before final submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      return;
    }

    setLoading(true);

    try {
      let storedUser = localStorage.getItem("userData");
      if (!storedUser) {
        storedUser = localStorage.getItem("adminData");
      }
      let userId = null;
      let userRole = "user";
      let userName = "";

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userId = userData.id;
        userRole = userData.role === "AGENT" ? "agent" : "user";
        userName = userData.name || "";
      }

      const finalCoords =
        coords ||
        (await geocodeProperty(
          `${form.address}, ${form.city}, ${form.state}, ${form.pincode}, India`,
          ""
        ));
      if (!finalCoords) {
        throw new Error("Location not found");
      }
      const finalAmenities =
        nearbyAmenities ||
        (await generateNearbyAmenities(finalCoords.lat, finalCoords.lng));

      const imageUrls = uploadedImages.map(img => img.url);
      const selectedPlanData = featuredPlans.find(p => p.id === selectedPlan);

      const propertyPayload = {
        id: crypto.randomUUID(),
        category: form.category || "residential",
        lister_id: userId,
        lister_type: userRole,
        lister_name: userName,
        title: form.title,
        subtitle: form.title,
        description: form.description,
        city: form.city,
        city_id: form.city_id,
        sub_area_id: form.sub_area_id,
        state: form.state,
        pincode: form.pincode,
        location: form.address,
        fullLocation: `${form.address}, ${form.city}, ${form.state}, ${form.pincode}`,
        type: form.propertyType,
        listingType: form.listingType === "Sell" ? "For Sale" : form.listingType === "Rent" ? "For Rent" : "PG",
        beds: form.category === "residential" ? Number(form.bedrooms) : 0,
        bathrooms: form.category === "residential" ? Number(form.bedrooms) : 1,
        area: Number(form.area),
        price: `₹${form.price}`,
        priceNum: Number(form.price),
        furnishing: form.furnishing,
        ...(form.category === "commercial" && {
          officeType: form.officeType,
          pantry: form.pantry === "yes",
          washrooms: Number(form.washrooms),
          powerBackup: form.powerBackup === "yes",
          cabinCount: Number(form.cabinCount),
          conferenceRoom: form.conferenceRoom === "yes",
        }),
        amenities: form.amenities,
        coordinates: finalCoords,
        nearbyAmenities: finalAmenities,
        images: imageUrls,
        imgs: imageUrls,
        image: imageUrls[0] || "",
        img: imageUrls[0] || "",
        rating: 0,
        reviews: 0,
        isNew: true,
        status: "PENDING",
        moderationStatus: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cloudinaryImages: uploadedImages.map(img => ({
          url: img.url,
          public_id: img.public_id
        })),
        // ✅ Featured fields
        featured: featuredOption === "plan",
        featuredRequested: featuredOption === "plan",
        requested_for: featuredOption === "plan" ? selectedPlanData?.requested_for || 0 : 0,
        granted_for: null,
        featuredRequestDate: featuredOption === "plan" ? new Date().toISOString() : null,
        featuredPaymentStatus: featuredOption === "plan" ? "pending" : null,
        featuredPaymentProof: featuredOption === "plan" ? paymentProof?.url || null : null,
        featuredPaymentAmount: featuredOption === "plan" ? selectedPlanData?.price || null : null,
        featuredApprovedBy: null,
        featuredApprovedAt: null,
        featuredExpiryDate: null,
        featuredExpired: false,
        featuredRejectionReason: null,
      };

      console.log("FINAL PROPERTY PAYLOAD", propertyPayload);

      toast.success("Property submitted successfully!", {
        description: "Your property is now waiting for admin approval.",
      });

      setTimeout(() => {
        if (userRole === "agent") {
          router.push("/agent/properties");
        } else {
          router.push("/properties");
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error("Unable to process property location", {
        description: "Please verify the address and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-estate-bg px-6 py-10">
      <div className="mx-auto max-w-[840px]">
        <div className="mb-9 text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-xl bg-estate-navy px-5 py-2.5 text-white">
            <Building2 size={18} aria-hidden="true" />
            <span className="font-bold">List Your Property - Free</span>
          </div>
          <h1 className="mb-2.5 font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">
            Reach Lakhs of Verified Buyers
          </h1>
          <p className="text-[15px] text-estate-text-sec">
            Fill in the details below to list your property and start receiving genuine inquiries
          </p>
        </div>

        {/* Step indicator */}
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
                      !done && !active && "border-estate-border bg-estate-bg text-estate-muted"
                    )}
                  >
                    {done ? <Check size={18} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                  </div>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[11px] font-semibold",
                      stepNumber <= step ? "text-estate-navy" : "text-estate-muted"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < stepItems.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 mb-4 h-0.5 flex-1 transition",
                      done ? "bg-estate-success" : "bg-estate-border"
                    )}
                  />
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

              {/* Category Selection */}
              <div className="mb-6">
                <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-estate-text">Category</div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      update("category", "residential");
                      if (form.category !== "residential") {
                        update("propertyType", "Apartment");
                        update("bedrooms", "3");
                      }
                    }}
                    className={`p-6 rounded-xl border-2 text-center transition ${
                      form.category === "residential"
                        ? "border-estate-navy bg-estate-blue-pale"
                        : "border-estate-border hover:border-estate-navy/50"
                    }`}
                  >
                    <span className="text-4xl block mb-2">🏠</span>
                    <span className="font-bold text-estate-navy">Residential</span>
                    <p className="text-xs text-estate-muted mt-1">Apartments, Villas, Studios</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      update("category", "commercial");
                      if (form.category !== "commercial") {
                        update("propertyType", "Commercial");
                        update("officeType", "Office Space");
                      }
                    }}
                    className={`p-6 rounded-xl border-2 text-center transition ${
                      form.category === "commercial"
                        ? "border-estate-navy bg-estate-blue-pale"
                        : "border-estate-border hover:border-estate-navy/50"
                    }`}
                  >
                    <span className="text-4xl block mb-2">🏢</span>
                    <span className="font-bold text-estate-navy">Commercial</span>
                    <p className="text-xs text-estate-muted mt-1">Offices, Shops, Warehouses</p>
                  </button>
                </div>
              </div>

              <ChoiceGroup
                title="I want to"
                values={["Sell", "Rent", "PG"]}
                active={form.listingType}
                onSelect={(value) => update("listingType", value)}
                columns="grid-cols-3"
                strong
              />

              {form.category === "residential" && (
                <>
                  <ChoiceGroup
                    title="Property Type"
                    values={residentialTypes}
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
                </>
              )}

              {form.category === "commercial" && (
                <>
                  <ChoiceGroup
                    title="Property Type"
                    values={commercialTypes}
                    active={form.propertyType}
                    onSelect={(value) => update("propertyType", value)}
                    columns="grid-cols-2 sm:grid-cols-4"
                  />

                  <ChoiceGroup
                    title="Office / Space Type"
                    values={["Office Space", "Retail Space", "Warehouse", "Showroom", "Industrial", "Coworking", "Commercial Plot"]}
                    active={form.officeType}
                    onSelect={(value) => update("officeType", value)}
                    columns="grid-cols-2 sm:grid-cols-4"
                  />
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">Where is your property?</h2>
              <p className="mb-7 text-sm text-estate-text-sec">Accurate location details help buyers find your property</p>

              <Input
                label="Full Address"
                value={form.address}
                onChange={(event) => {
                  update("address", event.target.value);
                  setNearbyAmenities(null);
                  setCoords(null);
                }}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                    State *
                  </span>
                  <select
                    value={form.state}
                    onChange={(e) => {
                      update("state", e.target.value);
                      update("city", "");
                      setNearbyAmenities(null);
                      setCoords(null);
                    }}
                    className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Pincode"
                  placeholder="400 001"
                  value={form.pincode}
                  onChange={(event) => {
                    update("pincode", event.target.value);
                    setNearbyAmenities(null);
                    setCoords(null);
                  }}
                  required
                  disabled={loading}
                />
                {/* City ID Selection */}
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                    City <span className="text-estate-red">*</span>
                  </span>
                  <select
                    value={form.city_id}
                    onChange={(e) => {
                      const cityId = e.target.value;
                      update("city_id", cityId);
                      const selectedCity = citiesList.find(c => c.id === cityId);
                      if (selectedCity) {
                        update("city", selectedCity.name);
                      }
                      setNearbyAmenities(null);
                      setCoords(null);
                      update("sub_area_id", "");
                    }}
                    className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3"
                  >
                    <option value="">Select City</option>
                    {citiesList.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Sub-area Selection */}
                {form.city_id && (
                  <label className="mb-4 block">
                    <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                      Select Sub-area <span className="text-estate-red">*</span>
                    </span>
                    <select
                      value={form.sub_area_id}
                      onChange={(e) => update("sub_area_id", e.target.value)}
                      className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3"
                    >
                      <option value="">Select Sub-area</option>
                      {subareasList
                        .filter((s: any) => s.city_id === form.city_id && s.status === "active")
                        .map((subarea: any) => (
                          <option key={subarea.id} value={subarea.id}>
                            {subarea.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <Button
                  type="button"
                  onClick={previewAmenities}
                  disabled={
                    !form.address ||
                    !form.city ||
                    !form.state ||
                    !form.pincode ||
                    loadingAmenities
                  }
                >
                  {loadingAmenities ? "Finding Nearby Amenities..." : "Check Nearby Amenities"}
                </Button>
                {nearbyAmenities && (
                  <>
                    {coords && (
                      <div className="mt-3 text-xs text-gray-500">
                        Latitude: {coords.lat}
                        <br />
                        Longitude: {coords.lng}
                      </div>
                    )}
                    <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                      <h3 className="mb-4 text-lg font-bold text-green-800">
                        Nearby Amenities Found
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["🏥 Hospital", nearbyAmenities.hospital],
                          ["🏫 School", nearbyAmenities.school],
                          ["🛒 Supermarket", nearbyAmenities.supermarket],
                          ["⛽ Petrol Pump", nearbyAmenities.petrol],
                          ["🚉 Railway Station", nearbyAmenities.station],
                          ["🏦 Bank", nearbyAmenities.bank],
                          ["🍴 Restaurant", nearbyAmenities.restaurant],
                          ["🏧 ATM", nearbyAmenities.atm],
                          ["💊 Pharmacy", nearbyAmenities.pharmacy],
                          ["🚌 Bus Station", nearbyAmenities.busStation],
                          ["🎓 College", nearbyAmenities.college],
                          ["🌳 Park", nearbyAmenities.park],
                          ["✈️ Airport", nearbyAmenities.airport],
                        ].map(([label, item]) => (
                          <div key={label} className="rounded-xl border bg-white p-3">
                            <div className="font-medium text-estate-navy">{label}</div>
                            {item ? (
                              <>
                                <div className="mt-1 text-sm font-semibold">{item.name}</div>
                                <div className="text-xs text-estate-muted">{item.distance} km away</div>
                                <div className="text-xs text-estate-muted">Approx. {item.travelTime}</div>
                              </>
                            ) : (
                              <div className="mt-1 text-xs text-red-500">Not found nearby</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className="mt-2 flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-estate-border-med bg-estate-bg transition hover:bg-estate-blue-pale"
                onClick={() => setIsMapOpen(true)}
              >
                <MapPin size={32} aria-hidden="true" className="mb-2.5 text-estate-blue" />
                <div className="mb-1 text-[15px] font-semibold text-estate-navy">Pin Location on Map</div>
                <div className="text-[13px] text-estate-muted">Click to open map and select exact location</div>
                {coords && (
                  <div className="mt-2 text-xs text-estate-muted">
                    Selected: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </div>
                )}
                <div className="mt-3.5 flex gap-2">
                  <Button
                    size="sm"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapOpen(true);
                    }}
                  >
                    <LocateFixed size={14} aria-hidden="true" /> Use My Location
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapOpen(true);
                    }}
                  >
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

              <Input
                label="Property Title"
                placeholder="e.g. Spacious 3BHK with Sea View in Worli"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                required
                disabled={loading}
              />
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
                <Input
                  label="Carpet Area (sq.ft)"
                  placeholder="e.g. 1200"
                  value={form.area}
                  onChange={(event) => update("area", event.target.value)}
                  icon={<Maximize2 size={15} />}
                  required
                  disabled={loading}
                />
              </div>

              {form.category === "commercial" && (
                <div className="mb-6 rounded-[18px] border border-estate-border/80 bg-estate-bg p-4">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">Commercial Details</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Pantry / Kitchen</span>
                      <select
                        value={form.pantry}
                        onChange={(e) => update("pantry", e.target.value)}
                        className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3 text-sm"
                      >
                        <option value="no">Not Available</option>
                        <option value="yes">Available</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Washrooms</span>
                      <input
                        type="number"
                        min="0"
                        value={form.washrooms}
                        onChange={(e) => update("washrooms", e.target.value)}
                        placeholder="e.g. 2"
                        className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Power Backup</span>
                      <select
                        value={form.powerBackup}
                        onChange={(e) => update("powerBackup", e.target.value)}
                        className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3 text-sm"
                      >
                        <option value="no">Not Available</option>
                        <option value="yes">Available</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Cabins / Offices</span>
                      <input
                        type="number"
                        min="0"
                        value={form.cabinCount}
                        onChange={(e) => update("cabinCount", e.target.value)}
                        placeholder="e.g. 4"
                        className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">Conference Room</span>
                      <select
                        value={form.conferenceRoom}
                        onChange={(e) => update("conferenceRoom", e.target.value)}
                        className="focus-field w-full rounded-lg border-[1.5px] border-estate-border py-2.5 px-3 text-sm"
                      >
                        <option value="no">Not Available</option>
                        <option value="yes">Available</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

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
                          selected ? "border-estate-blue bg-estate-blue-pale" : "border-estate-border bg-white"
                        )}
                        onClick={() => toggleAmenity(amenity)}
                        disabled={loading}
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2",
                            selected ? "border-estate-blue bg-estate-blue text-white" : "border-estate-border bg-white"
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

              <div className="mb-6">
                <div
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-estate-blue/40 bg-[#F8FBFF] p-6 text-center transition hover:border-estate-blue hover:bg-estate-blue-pale"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  <div className="mx-auto mb-3.5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-estate-blue-pale text-estate-blue">
                    {uploadingImages ? (
                      <Loader2 size={26} className="animate-spin" />
                    ) : (
                      <Upload size={26} aria-hidden="true" />
                    )}
                  </div>
                  <div className="mb-1.5 text-base font-bold text-estate-navy">
                    {uploadingImages ? `Uploading... ${uploadProgress}%` : "Drag & Drop Photos Here"}
                  </div>
                  <div className="mb-4 text-sm text-estate-text-sec">
                    {uploadingImages ? "Please wait while images are uploaded" : "or click to browse from your device"}
                  </div>
                  {!uploadingImages && (
                    <Button variant="outline" size="sm" disabled={loading}>
                      <Camera size={14} aria-hidden="true" /> Select Photos
                    </Button>
                  )}
                  <div className="mt-3 text-xs text-estate-muted">
                    {uploadedImages.length}/10 images uploaded · JPG, PNG, HEIF up to 10MB
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-estate-navy mb-3">
                      Uploaded Images ({uploadedImages.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative rounded-lg overflow-hidden border border-estate-border">
                            <Image
                              src={img.url}
                              alt={`Property image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedImages.length < 3 && uploadedImages.length > 0 && (
                  <div className="mt-3 text-sm text-amber-600">
                    ⚠️ Please upload at least {3 - uploadedImages.length} more image(s) (minimum 3 required)
                  </div>
                )}
              </div>

              <div className="mb-6 rounded-xl bg-estate-amber-pale p-[18px]">
                <div className="mb-2.5 text-[13px] font-bold text-estate-amber-dark">Tips for Great Photos</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {["Shoot in daylight for best results", "Capture all rooms including kitchen", "Include building exterior", "Show parking and amenities"].map(
                    (tip) => (
                      <div key={tip} className="flex items-center gap-2 text-[13px] text-estate-text-sec">
                        <CheckCircle size={13} aria-hidden="true" className="shrink-0 text-estate-amber" />
                        {tip}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-[14px] bg-estate-bg p-5">
                <div className="mb-3.5 text-sm font-bold text-estate-navy">Listing Summary</div>
                {[
                  ["Category", form.category === "residential" ? "Residential" : form.category === "commercial" ? "Commercial" : "Not set"],
                  ["Listing Type", form.listingType || "Not set"],
                  ["Property Type", form.category === "commercial" ? form.propertyType : `${form.bedrooms ? `${form.bedrooms} BHK ` : ""}${form.propertyType}`],
                  ["Location", form.city ? `${form.address || "-"}, ${form.city}, ${form.state}` : "Not set"],
                  ["Price", form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "Not set"],
                  ["Images", `${uploadedImages.length} uploaded`],
                ].map(([label, value]) => (
                  <div key={label} className="mb-2.5 flex justify-between gap-4 text-sm last:mb-0">
                    <span className="text-estate-muted">{label}</span>
                    <span className="text-right font-semibold text-estate-text">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="mb-1.5 font-serif text-[22px] text-estate-navy">Feature Your Property</h2>
              <p className="mb-7 text-sm text-estate-text-sec">
                Get more visibility by featuring your property. Choose a plan or skip for now.
              </p>

              {/* Option to skip */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedOption("none");
                    setSelectedPlan(null);
                    setPaymentProof(null);
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    featuredOption === "none"
                      ? "border-estate-navy bg-estate-blue-pale"
                      : "border-estate-border hover:border-estate-navy/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-estate-navy">Skip for now</h3>
                      <p className="text-sm text-estate-muted">List your property without featuring</p>
                    </div>
                    {featuredOption === "none" && (
                      <CheckCircle size={20} className="text-estate-navy" />
                    )}
                  </div>
                </button>
              </div>

              {/* Featured Plans */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-estate-text">Featured Plans</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setFeaturedOption("plan");
                        setSelectedPlan(plan.id);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        selectedPlan === plan.id
                          ? "border-estate-amber bg-amber-50"
                          : "border-estate-border hover:border-estate-amber/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-estate-navy">{plan.name}</h4>
                        {selectedPlan === plan.id && (
                          <CheckCircle size={18} className="text-estate-amber" />
                        )}
                      </div>
                      <p className="text-sm text-estate-muted mt-1">{plan.description}</p>
                      <p className="text-xl font-bold text-estate-amber mt-2">
                        ₹{plan.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-estate-muted">{plan.duration} days featured</p>
                      <ul className="mt-3 space-y-1">
                        {plan.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="text-xs text-estate-text flex items-start gap-1">
                            <Check size={12} className="text-estate-amber mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Section - Only show when a plan is selected */}
              {selectedPlan && featuredOption === "plan" && (
                <div className="mt-6 p-4 border border-estate-border rounded-xl bg-gray-50">
                  <h4 className="font-bold text-estate-navy mb-3">Complete Payment</h4>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* QR Code */}
                    <div className="flex-1 text-center">
                      <p className="text-sm text-estate-muted mb-2">Scan to Pay</p>
                      <div className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                        {qrImage ? (
                          <Image 
                            src={qrImage} 
                            alt="Payment QR Code" 
                            width={180} 
                            height={180}
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex flex-col items-center justify-center h-full p-4 text-center">
                                    <span class="text-3xl mb-2">📱</span>
                                    <span class="text-sm text-estate-muted">QR Code Placeholder</span>
                                    <span class="text-xs text-estate-muted">₹${featuredPlans.find(p => p.id === selectedPlan)?.price || 0}</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <span className="text-3xl mb-2">📱</span>
                            <span className="text-sm text-estate-muted">QR Code</span>
                            <span className="text-xs text-estate-muted">Upload QR image to /public/images/qr-code.png</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-estate-muted mt-2">
                        Amount: ₹{featuredPlans.find(p => p.id === selectedPlan)?.price || 0}
                      </p>
                    </div>

                    {/* Upload Payment Proof */}
                    <div className="flex-1">
                      <p className="text-sm text-estate-muted mb-2">Upload Payment Screenshot</p>
                      <div className="border-2 border-dashed border-estate-border rounded-xl p-4 text-center hover:border-estate-navy transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadPaymentProof(file);
                            }
                          }}
                          className="hidden"
                          id="payment-proof-upload"
                          disabled={uploadingPaymentProof}
                        />
                        <label 
                          htmlFor="payment-proof-upload" 
                          className="cursor-pointer block"
                        >
                          {uploadingPaymentProof ? (
                            <div className="flex flex-col items-center">
                              <Loader2 size={24} className="animate-spin text-estate-navy" />
                              <span className="text-sm text-estate-muted mt-2">Uploading...</span>
                            </div>
                          ) : paymentProof ? (
                            <div className="relative">
                              <Image
                                src={paymentProof.url}
                                alt="Payment Proof"
                                width={150}
                                height={150}
                                className="mx-auto rounded-lg object-cover max-h-32"
                              />
                              <div className="mt-2 text-sm text-emerald-600">✓ Proof uploaded</div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPaymentProof(null);
                                }}
                                className="text-xs text-red-500 hover:text-red-600 mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center py-4">
                              <Upload size={32} className="text-estate-muted" />
                              <span className="text-sm text-estate-muted mt-2">
                                Click to upload payment screenshot
                              </span>
                              <span className="text-xs text-estate-muted">
                                JPG, PNG up to 5MB
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Picker Modal */}
        <MapPicker
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onLocationSelect={handleLocationSelect}
          initialLat={coords?.lat}
          initialLng={coords?.lng}
          address={form.address}
        />

        <div className="flex items-center justify-between gap-4">
          <button
            className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-estate-border bg-white px-5 py-3 text-sm font-semibold text-estate-text-sec disabled:opacity-50"
            onClick={handleBack}
            disabled={loading || uploadingImages}
          >
            <ChevronLeft size={16} aria-hidden="true" /> {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-[13px] text-estate-muted">
              Step {step} of {totalSteps}
            </span>
            {[1, 2, 3, 4, 5].map((item) => (
              <span
                key={item}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  item <= step ? "w-6 bg-estate-navy" : "w-2.5 bg-estate-border"
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant={step === totalSteps ? "amber" : "navy"}
            onClick={() => {
              if (step < totalSteps) {
                handleNext();
                return;
              }
              handleSubmit();
            }}
            disabled={loading || uploadingImages}
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
                  : "border-estate-border bg-white text-estate-text-sec"
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