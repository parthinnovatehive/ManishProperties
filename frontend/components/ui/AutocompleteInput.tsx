"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Suggestion {
  id: string;
  label: string;
  type: "city" | "subarea" | "propertyType" | "project";
  icon?: React.ReactNode;
  category?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder: string;
  suggestions: Suggestion[];
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder,
  suggestions,
  icon,
  className,
  loading = false,
  disabled = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          onSelect(value);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            onSelect(suggestions[highlightedIndex].label);
          } else {
            onSelect(value);
          }
          setIsOpen(false);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, onSelect, value]
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-estate-blue transition">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (value.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={cn(
            "w-full rounded-[14px] border-[1.5px] border-estate-border bg-estate-bg/65 py-3.5 pl-10 pr-10 text-sm text-estate-text shadow-sm transition",
            "hover:border-estate-border-med hover:bg-white focus:bg-white focus:border-estate-navy focus:ring-2 focus:ring-estate-navy/20 focus:outline-none",
            className
          )}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {value && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition"
            aria-label="Clear input"
          >
            <X size={14} className="text-estate-muted" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-estate-navy border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-estate-border rounded-xl shadow-estate-lg max-h-72 overflow-y-auto animate-fade-up"
          role="listbox"
        >
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => {
                  onSelect(suggestion.label);
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition text-left",
                  highlightedIndex === index
                    ? "bg-estate-blue-pale text-estate-navy"
                    : "hover:bg-estate-bg text-estate-text"
                )}
              >
                <span className="flex-shrink-0 text-base">
                  {suggestion.icon ||
                    (suggestion.type === "city" ? "📍" :
                     suggestion.type === "subarea" ? "🏘️" :
                     suggestion.type === "propertyType" ? "🏠" :
                     "🔍")}
                </span>
                <span className="flex-1 truncate">{suggestion.label}</span>
                {suggestion.category && (
                  <span className="text-[10px] font-medium text-estate-muted bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {suggestion.category}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
