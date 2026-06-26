"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Property } from "@/types";
import { apiClient } from "@/lib/api/client";
import { estateApi } from "@/lib/api";
import Image from "next/image";
import { X, Check, CheckCircle, Loader2, Upload, Star } from "lucide-react";
import { toast } from "sonner";

interface FeaturedPlan {
  id: string;
  name: string;
  requested_for: number;
  duration: number;
  price: number;
  description: string;
  features: string[];
}

interface UploadedImage {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
}

interface FeatureRequestModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeatureRequestModal({
  property,
  isOpen,
  onClose,
  onSuccess,
}: FeatureRequestModalProps) {
  const [plans, setPlans] = useState<FeaturedPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<UploadedImage | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrImage, setQrImage] = useState("/images/qr-code.png");

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setSelectedPlanId(null);
      setPaymentProof(null);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get("/api/content/featured-plans");
      if (response.success) {
        setPlans(response.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch featured plans:", error);
    }
  };

  const uploadPaymentProof = useCallback(async (file: File) => {
    setUploadingProof(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const response = await apiClient.post(
        "/api/properties/upload-images?category=payment_proof",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const images = response.data?.images || response.images;
      if (response.success && images && images.length > 0) {
        const img = images[0];
        setPaymentProof({
          url: img.url,
          public_id: img.public_id,
          width: img.width,
          height: img.height,
        });
        toast.success("Payment proof uploaded!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload payment proof");
    } finally {
      setUploadingProof(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!property || !selectedPlanId) return;

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) return;

    if (!paymentProof) {
      toast.error("Please upload payment proof");
      return;
    }

    setSubmitting(true);
    try {
      await estateApi.adminProperties.update(property.id, {
        featuredRequested: true,
        requested_for: selectedPlan.requested_for,
        featuredPaymentStatus: "pending",
        featuredPaymentProof: paymentProof.url,
        featuredPaymentAmount: selectedPlan.price,
        featuredRequestDate: new Date().toISOString(),
      });

      toast.success("Featured request submitted!", {
        description: "Your request is pending admin approval.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to submit featured request:", error);
      toast.error("Failed to submit featured request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !property) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-estate-border animate-fade-up">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-estate-border p-5 flex justify-between items-center z-10">
            <div>
              <h2 className="text-lg font-bold text-estate-navy font-serif">
                Request Featured
              </h2>
              <p className="text-xs text-estate-muted mt-0.5">
                {property.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-estate-surface rounded-lg transition"
            >
              <X className="w-5 h-5 text-estate-text-sec" />
            </button>
          </div>

          <div className="p-5 space-y-5">
          {/* Plans */}
          <div>
            <label className="block text-sm font-bold text-estate-text mb-3">
              Select Plan
            </label>
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    selectedPlanId === plan.id
                      ? "border-estate-amber bg-amber-50"
                      : "border-estate-border hover:border-estate-amber/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          selectedPlanId === plan.id
                            ? "border-estate-amber bg-estate-amber"
                            : "border-estate-border"
                        }`}
                      >
                        {selectedPlanId === plan.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-estate-navy text-sm">
                          {plan.name}
                        </span>
                        <p className="text-xs text-estate-muted">
                          {plan.duration} days featured
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-estate-amber text-lg">
                      ₹{plan.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-estate-text-sec mt-2 ml-8">
                    {plan.description}
                  </p>
                  <ul className="mt-2 ml-8 space-y-0.5">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-[11px] text-estate-text flex items-start gap-1"
                      >
                        <Check
                          size={10}
                          className="text-estate-amber mt-0.5 flex-shrink-0"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          {selectedPlan && (
            <div className="p-4 border border-estate-border rounded-xl bg-gray-50">
              <h4 className="font-bold text-estate-navy mb-3 text-sm">
                Complete Payment
              </h4>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* QR Code */}
                <div className="flex-1 text-center">
                  <p className="text-xs text-estate-muted mb-2">Scan to Pay</p>
                  <div className="w-40 h-40 mx-auto border-2 border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={qrImage}
                      alt="Payment QR Code"
                      width={150}
                      height={150}
                      className="object-contain"
                      onError={() => setQrImage("")}
                    />
                    {!qrImage && (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-2xl mb-1">📱</span>
                        <span className="text-xs text-estate-muted">QR Code</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-estate-muted mt-2">
                    Amount: ₹{selectedPlan.price.toLocaleString()}
                  </p>
                </div>

                {/* Upload Payment Proof */}
                <div className="flex-1">
                  <p className="text-xs text-estate-muted mb-2">
                    Upload Payment Screenshot
                  </p>
                  <div className="border-2 border-dashed border-estate-border rounded-xl p-3 text-center hover:border-estate-navy transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPaymentProof(file);
                      }}
                      className="hidden"
                      id="feature-payment-proof"
                      disabled={uploadingProof}
                    />
                    <label
                      htmlFor="feature-payment-proof"
                      className="cursor-pointer block"
                    >
                      {uploadingProof ? (
                        <div className="flex flex-col items-center py-4">
                          <Loader2
                            size={20}
                            className="animate-spin text-estate-navy"
                          />
                          <span className="text-xs text-estate-muted mt-2">
                            Uploading...
                          </span>
                        </div>
                      ) : paymentProof ? (
                        <div className="relative">
                          <Image
                            src={paymentProof.url}
                            alt="Payment Proof"
                            width={200}
                            height={150}
                            className="mx-auto rounded-lg object-cover max-h-24"
                          />
                          <div className="mt-1 text-xs text-emerald-600">
                            ✓ Proof uploaded
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentProof(null);
                            }}
                            className="text-[11px] text-red-500 hover:text-red-600 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-3">
                          <Upload size={24} className="text-estate-muted" />
                          <span className="text-xs text-estate-muted mt-1">
                            Click to upload
                          </span>
                          <span className="text-[10px] text-estate-muted">
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-estate-border p-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPlanId || !paymentProof || submitting}
            className="flex-1 py-2.5 rounded-xl bg-estate-amber text-white text-sm font-bold hover:bg-estate-amber-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Star size={16} /> Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}
