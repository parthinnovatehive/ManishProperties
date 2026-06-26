"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ArrowRight, Home, Key, FileText, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { QuestionnaireAnswers } from "@/lib/utils/propertyFilters";

interface PropertyQuestionnaireModalProps {
  open: boolean;
  cities: string[];
  onComplete: (answers: QuestionnaireAnswers) => void;
  onSkip: () => void;
  onClose: () => void;
}

interface Question {
  id: keyof QuestionnaireAnswers;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const questions: Question[] = [
  { id: "category", title: "What type of property are you looking for?", subtitle: "Choose between residential and commercial", icon: <Home size={20} /> },
  { id: "listingType", title: "Are you looking to buy or rent?", subtitle: "Select your preferred listing type", icon: <Key size={20} /> },
  { id: "budget", title: "What is your budget range?", subtitle: "Select a budget to find properties in your range", icon: <FileText size={20} /> },
  { id: "bhk", title: "How many bedrooms do you need?", subtitle: "Choose the number of bedrooms", icon: <Home size={20} /> },
  { id: "city", title: "Which city are you looking in?", subtitle: "Select a city or skip to see all", icon: <MapPin size={20} /> },
];

const categoryOptions = [
  { value: "residential" as const, label: "Residential", icon: "🏠", desc: "Apartments, villas, plots" },
  { value: "commercial" as const, label: "Commercial", icon: "🏢", desc: "Offices, retail, warehouses" },
];

const listingTypeOptions = [
  { value: "For Sale" as const, label: "Buy", icon: "🔑", desc: "Purchase a property" },
  { value: "For Rent" as const, label: "Rent", icon: "📋", desc: "Rent a property" },
];

const buyBudgetOptions = [
  { value: "under_50l" as const, label: "Under ₹50 Lakhs", range: "₹0 - ₹50L" },
  { value: "50l_1cr" as const, label: "₹50 Lakhs - ₹1 Cr", range: "₹50L - ₹1Cr" },
  { value: "1cr_2cr" as const, label: "₹1 Cr - ₹2 Cr", range: "₹1Cr - ₹2Cr" },
  { value: "2cr_5cr" as const, label: "₹2 Cr - ₹5 Cr", range: "₹2Cr - ₹5Cr" },
  { value: "5cr_plus" as const, label: "₹5 Cr+", range: "₹5Cr+" },
  { value: "no_preference" as const, label: "No Preference" },
];

const rentBudgetOptions = [
  { value: "under_10k" as const, label: "Under ₹10,000/mo", range: "₹0 - ₹10K" },
  { value: "10k_20k" as const, label: "₹10,000 - ₹20,000/mo", range: "₹10K - ₹20K" },
  { value: "20k_30k" as const, label: "₹20,000 - ₹30,000/mo", range: "₹20K - ₹30K" },
  { value: "30k_50k" as const, label: "₹30,000 - ₹50,000/mo", range: "₹30K - ₹50K" },
  { value: "50k_plus" as const, label: "₹50,000+/mo", range: "₹50K+" },
  { value: "no_preference" as const, label: "No Preference" },
];

const bhkOptions = [
  { value: "1" as const, label: "1 BHK" },
  { value: "2" as const, label: "2 BHK" },
  { value: "3" as const, label: "3 BHK" },
  { value: "4" as const, label: "4 BHK" },
  { value: "5+" as const, label: "5+ BHK" },
  { value: "no_preference" as const, label: "Any" },
];

const initialAnswers: QuestionnaireAnswers = {
  category: null,
  listingType: null,
  budget: null,
  bhk: null,
  city: null,
};

export function PropertyQuestionnaireModal({
  open,
  cities,
  onComplete,
  onSkip,
  onClose,
}: PropertyQuestionnaireModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  // ESC key closes modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Check if current step has a selection
  const hasSelection = useMemo(() => {
    const val = answers[currentQuestion.id];
    if (currentQuestion.id === "city") return true;
    return val !== null;
  }, [answers, currentQuestion]);

  const canGoNext = hasSelection;
  const canGoPrev = step > 0;

  const handleSelect = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      if (step === 0 || step === 1) {
        setTimeout(() => {
          setDirection("next");
          setStep((s) => Math.min(s + 1, questions.length - 1));
        }, 200);
      }
    },
    [step, currentQuestion.id]
  );

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    setDirection("next");
    setStep((s) => Math.min(s + 1, questions.length - 1));
  }, [canGoNext]);

  const handlePrev = useCallback(() => {
    setDirection("prev");
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const resetAndClose = useCallback(
    (action: () => void) => {
      setStep(0);
      setAnswers(initialAnswers);
      action();
    },
    []
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose()}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-fade-up"
        role="dialog"
        aria-modal="true"
        aria-label="Property search questionnaire"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-white px-6 pb-0 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-estate-blue-pale text-estate-navy">
              <Search size={16} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-estate-navy">Find Your Perfect Property</h2>
              <p className="text-xs text-estate-muted">Answer a few quick questions</p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="rounded-lg p-1.5 text-estate-muted transition hover:bg-estate-bg hover:text-estate-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-6 mt-4 h-1.5 rounded-full bg-estate-bg">
          <div
            className="h-full rounded-full bg-estate-navy transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mx-6 mt-1.5 flex items-center justify-between text-[11px] font-medium text-estate-muted">
          <span>
            Step {step + 1} of {questions.length}
          </span>
          <span>{currentQuestion.title.split(" ").slice(0, 4).join(" ")}...</span>
        </div>

        {/* Question content */}
        <div className="px-6 py-6">
          <div
            key={step}
            className="transition-all duration-300 animate-fade-up"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-estate-navy text-white">
                {questions[step].icon}
              </span>
              <h3 className="text-base font-bold text-estate-navy">
                {currentQuestion.title}
              </h3>
            </div>
            <p className="mb-5 ml-10 text-xs text-estate-muted">
              {currentQuestion.subtitle}
            </p>

            {currentQuestion.id === "category" && (
              <div className="grid grid-cols-2 gap-3">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all duration-200",
                      answers.category === opt.value
                        ? "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-md"
                        : "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg"
                    )}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-[11px] text-estate-muted">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.id === "listingType" && (
              <div className="grid grid-cols-2 gap-3">
                {listingTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all duration-200",
                      answers.listingType === opt.value
                        ? "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-md"
                        : "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg"
                    )}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-[11px] text-estate-muted">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.id === "budget" && (() => {
              const isRent = answers.listingType === "For Rent";
              const options = isRent ? rentBudgetOptions : buyBudgetOptions;
              return (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isRent
                        ? "bg-orange-100 text-orange-700"
                        : "bg-estate-blue-pale text-estate-navy"
                    )}>
                      {isRent ? "📋 Rent" : "🔑 Buy"}
                      <span className="text-[10px] font-normal opacity-70">• {isRent ? "Monthly Rent" : "Purchase Price"}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-2xl border-2 px-4 py-4 text-center transition-all duration-200 min-h-[72px]",
                          answers.budget === opt.value
                            ? "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-md"
                            : "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg"
                        )}
                      >
                        <span className="text-sm font-bold leading-tight">{opt.label}</span>
                        {opt.range && (
                          <span className="text-[11px] text-estate-muted">{opt.range}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {currentQuestion.id === "bhk" && (
              <div className="flex flex-wrap gap-2.5">
                {bhkOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex-1 min-w-[72px] rounded-2xl border-2 px-4 py-4 text-center text-sm font-bold transition-all duration-200",
                      answers.bhk === opt.value
                        ? "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-md"
                        : "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.id === "city" && (
              <div>
                <select
                  value={answers.city ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      city: e.target.value || null,
                    }))
                  }
                  className="w-full appearance-none rounded-2xl border-2 border-estate-border bg-white px-5 py-4 text-sm text-estate-text shadow-sm transition focus:border-estate-navy focus:outline-none focus:ring-2 focus:ring-estate-navy/20"
                >
                  <option value="">All Cities — show properties everywhere</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-estate-muted">
                  You can skip this and filter by city later
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-3xl border-t border-estate-border bg-white px-6 py-4">
          <button
            onClick={() => resetAndClose(onSkip)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-estate-muted transition hover:bg-estate-bg hover:text-estate-text-sec"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {canGoPrev && (
              <Button
                variant="outline"
                className="rounded-xl px-4 py-2.5 text-sm"
                onClick={handlePrev}
              >
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Button>
            )}

            {isLastStep ? (
              <Button
                variant="navy"
                className="rounded-xl px-6 py-2.5 text-sm"
                onClick={() => resetAndClose(() => onComplete(answers))}
              >
                Show Results
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="navy"
                className={cn(
                  "rounded-xl px-6 py-2.5 text-sm transition",
                  !canGoNext && "opacity-50"
                )}
                onClick={handleNext}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight size={16} className="ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
