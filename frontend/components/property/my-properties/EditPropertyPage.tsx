"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Property } from "@/types";
import { estateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    priceNum: 0,
    location: "",
    city: "",
    pincode: "",
    beds: 0,
    bathrooms: 0,
    area: 0,
    furnishing: "",
    status: "",
  });

  useEffect(() => {
    if (!propertyId) return;
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await estateApi.adminProperties.list();
      const found = items.find(
        (p: Property) => String(p.id) === String(propertyId)
      );
      if (!found) {
        setError("Property not found");
        setLoading(false);
        return;
      }
      setProperty(found);
      setForm({
        title: found.title || "",
        description: found.description || "",
        price: found.price || "",
        priceNum: found.priceNum || 0,
        location: found.location || "",
        city: found.city || "",
        pincode: found.pincode || "",
        beds: found.beds || 0,
        bathrooms: found.bathrooms ?? found.baths ?? 0,
        area: found.area || 0,
        furnishing: found.furnishing || "",
        status: found.status || "PENDING",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load property"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    key: string,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!form.price.trim()) {
      toast.error("Price is required");
      return false;
    }
    if (!form.location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!form.city.trim()) {
      toast.error("City is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title: form.title,
        description: form.description,
        price: form.price,
        priceNum: form.priceNum,
        location: form.location,
        city: form.city,
        pincode: form.pincode,
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        furnishing: form.furnishing,
      };

      await estateApi.adminProperties.update(propertyId, payload);
      toast.success("Property updated successfully");
      // Determine the role from the property data
      const role = property?.lister_type === "agent" ? "agent" : "user";
      router.push(`/${role}/my-properties`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update property"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-estate-navy animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
            Edit Property
          </h1>
          <p className="text-sm text-estate-text-sec mt-0.5">
            Update the details of your property listing
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-estate-border/80 rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-estate-text mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
            placeholder="Property title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-estate-text mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition resize-none"
            placeholder="Property description"
          />
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Display Price
            </label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
              placeholder="e.g. ₹2.85 Cr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Numeric Price
            </label>
            <input
              type="number"
              value={form.priceNum}
              onChange={(e) =>
                updateField("priceNum", Number(e.target.value))
              }
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
              placeholder="e.g. 28500000"
            />
          </div>
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Location / Address
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
              placeholder="Full address"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
              placeholder="City name"
            />
          </div>
        </div>

        {/* Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
              placeholder="6-digit pincode"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Beds
            </label>
            <input
              type="number"
              min="0"
              value={form.beds}
              onChange={(e) => updateField("beds", Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) =>
                updateField("bathrooms", Number(e.target.value))
              }
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
            />
          </div>
        </div>

        {/* Area & Furnishing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Area (sq ft)
            </label>
            <input
              type="number"
              min="0"
              value={form.area}
              onChange={(e) => updateField("area", Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-estate-text mb-1.5">
              Furnishing
            </label>
            <select
              value={form.furnishing}
              onChange={(e) => updateField("furnishing", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-estate-border/80 rounded-xl focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 outline-none transition"
            >
              <option value="">Select furnishing</option>
              <option value="Unfurnished">Unfurnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Fully Furnished">Fully Furnished</option>
            </select>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-estate-bg rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-bold text-estate-text">Status</span>
          <span className="text-sm font-semibold text-estate-navy uppercase">
            {property?.status || "N/A"}
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
