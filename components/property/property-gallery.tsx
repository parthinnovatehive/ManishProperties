"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Heart, Images, Share2 } from "lucide-react";

type PropertyGalleryProps = {
  images: string[];
  title: string;
  listingType?: string | null;
  price?: string | null;
  area?: number | null;
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
};

const fallbackImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&q=75";

function pricePerSqft(price?: string | null, area?: number | null) {
  if (!price || !area) return null;

  const numericPrice = Number.parseInt(String(price).replace(/\D/g, ""), 10);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return (numericPrice / area).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function PropertyGallery({
  images,
  title,
  listingType,
  price,
  area,
  saved,
  onSavedChange,
}: PropertyGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [localSaved, setLocalSaved] = useState(false);

  const normalizedImages = useMemo(() => {
    const validImages = images.filter((image) => image.trim().length > 0);
    const displayImages = validImages.length > 0 ? [...validImages] : [fallbackImage];

    while (displayImages.length < 5) {
      displayImages.push(displayImages[0]);
    }

    return displayImages;
  }, [images]);

  const allPhotoCount = images.length > 0 ? images.length : 1;
  const isSaved = saved ?? localSaved;
  const sqftPrice = pricePerSqft(price, area);
  const activeImage = normalizedImages[activeImageIndex] ?? normalizedImages[0] ?? fallbackImage;

  const toggleSaved = () => {
    const nextSaved = !isSaved;
    setLocalSaved(nextSaved);
    onSavedChange?.(nextSaved);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6">
      <div className="group relative grid h-[52vh] min-h-[460px] grid-cols-1 overflow-hidden rounded-[20px] shadow-estate-lg md:h-[64vh] md:grid-cols-4 md:grid-rows-2 md:gap-1.5">
        <div className="relative col-span-1 cursor-pointer overflow-hidden bg-estate-surface md:col-span-2 md:row-span-2">
          <img
            src={activeImage}
            alt={title || "Property"}
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-estate-navy/80 via-estate-navy/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-estate-navy/20 via-transparent to-transparent" />

          <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-estate-navy shadow-sm backdrop-blur-md">
              <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              Verified
            </span>
            <span className="rounded-full bg-estate-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
              {listingType || "For Sale"}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-gray-900/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm backdrop-blur-md">
              Premium
            </span>
          </div>

          {price && (
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/55 mb-1.5">Asking Price</p>
                  <p className="text-3xl md:text-4xl font-light text-white tracking-tight leading-none">{price}</p>
                  {sqftPrice && <p className="text-xs text-white/50 mt-1.5 font-light">{sqftPrice} / sqft</p>}
                </div>
                <div className="flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-2 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] text-white font-medium whitespace-nowrap">42 viewing now</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {normalizedImages.slice(1, 5).map((image, index) => {
          const imageIndex = index + 1;
          const isActionTile = imageIndex === 2;
          const isAllPhotosTile = imageIndex === 4;

          return (
            <div
              key={`${image}-${imageIndex}`}
              className="relative hidden cursor-pointer overflow-hidden bg-estate-surface md:block"
              onClick={() => setActiveImageIndex(imageIndex)}
            >
              <img
                src={image}
                alt={isAllPhotosTile ? "View all photos" : `${title} ${imageIndex}`}
                className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-110"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />

              {isActionTile && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    aria-label={isSaved ? "Remove saved property" : "Save property"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSaved();
                    }}
                    className={`p-2.5 rounded-full shadow-md backdrop-blur-md border transition-all duration-200 ${
                      isSaved
                        ? "bg-red-500 border-red-400/50 text-white"
                        : "bg-white/90 border-white/50 text-gray-700 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                  <button
                    aria-label="Share property"
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-full border border-white/50 bg-white/90 p-2.5 text-gray-700 shadow-md backdrop-blur-md transition-all duration-200 hover:text-estate-navy"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isAllPhotosTile ? (
                <div className="absolute inset-0 bg-black/35 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <Images className="w-6 h-6 text-white mx-auto mb-2" />
                    <span className="text-white text-xs font-semibold tracking-wide">
                      View All {allPhotoCount} Photos
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
