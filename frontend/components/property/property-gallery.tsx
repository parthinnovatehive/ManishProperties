"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Grid, Heart, Images, Share2, X } from "lucide-react";

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
  
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const handleMobilePrev = () => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const width = container.clientWidth;
      const currentScroll = container.scrollLeft;
      if (currentScroll <= 10) {
        container.scrollTo({
          left: width * (displayAllImages.length - 1),
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: -width,
          behavior: "smooth",
        });
      }
    }
  };

  const handleMobileNext = () => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const width = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const maxScroll = width * (displayAllImages.length - 1);
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: width,
          behavior: "smooth",
        });
      }
    }
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);
  const [modalViewMode, setModalViewMode] = useState<"grid" | "lightbox">("grid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Touch swipe support for lightbox view
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setModalActiveIndex((prev) => (prev + 1) % displayAllImages.length);
    }
    if (isRightSwipe) {
      setModalActiveIndex((prev) => (prev - 1 + displayAllImages.length) % displayAllImages.length);
    }
  };

  const displayAllImages = useMemo(() => {
    const validImages = images.filter((image) => image && image.trim().length > 0);
    return validImages.length > 0 ? validImages : [fallbackImage];
  }, [images]);

  const normalizedImages = useMemo(() => {
    const validImages = images.filter((image) => image.trim().length > 0);
    const displayImages = validImages.length > 0 ? [...validImages] : [fallbackImage];

    while (displayImages.length < 5) {
      displayImages.push(displayImages[0]);
    }

    return displayImages;
  }, [images]);

  const allPhotoCount = displayAllImages.length;
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
      {/* Dynamic inline styles to hide scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Mobile View: Horizontal Snap Scroll Carousel (visible on < md) */}
      <div className="relative block md:hidden w-full h-[45vh] min-h-[320px] overflow-hidden rounded-[20px] shadow-estate-lg bg-estate-surface">
        {/* Navigation Arrows for Mobile */}
        {displayAllImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobilePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 hover:bg-white/90 active:scale-95 text-estate-navy shadow-md border border-white/20 transition-all"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 hover:bg-white/90 active:scale-95 text-estate-navy shadow-md border border-white/20 transition-all"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <div 
          ref={mobileScrollRef}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const width = e.currentTarget.clientWidth;
            if (width > 0) {
              const newIndex = Math.round(scrollLeft / width);
              setActiveImageIndex(newIndex % displayAllImages.length);
            }
          }}
        >
          {displayAllImages.map((image, index) => (
            <div 
              key={index} 
              className="w-full h-full flex-shrink-0 snap-start snap-always relative cursor-pointer"
              onClick={() => {
                setModalActiveIndex(index);
                setModalViewMode("lightbox");
                setIsModalOpen(true);
              }}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay for bottom text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-estate-navy/80 via-estate-navy/10 to-transparent" />

        {/* Top-left Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
          <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-estate-navy shadow-sm backdrop-blur-md">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
            Verified
          </span>
          <span className="rounded-full bg-estate-navy px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
            {listingType || "For Sale"}
          </span>
        </div>

        {/* Top-right Actions */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          <button
            aria-label={isSaved ? "Remove saved property" : "Save property"}
            onClick={(event) => {
              event.stopPropagation();
              toggleSaved();
            }}
            className={`p-2 rounded-full shadow-md backdrop-blur-md border transition-all duration-200 ${
              isSaved
                ? "bg-red-500 border-red-400/50 text-white"
                : "bg-white/90 border-white/50 text-gray-700 hover:text-red-500"
            }`}
          >
            <Heart className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`} />
          </button>
          <button
            aria-label="Share property"
            onClick={(event) => {
              event.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title: title,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="rounded-full border border-white/50 bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur-md transition-all duration-200 hover:text-estate-navy"
          >
            <Share2 className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Details (Price & Viewing) */}
        {price && (
          <div className="absolute bottom-5 left-5 right-5 z-10 flex justify-between items-end gap-3 pointer-events-none">
            <div>
              <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/60 mb-0.5">Asking Price</p>
              <p className="text-xl font-light text-white tracking-tight leading-none">{price}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 flex-shrink-0">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[9px] text-white font-medium whitespace-nowrap">42 viewing</span>
            </div>
          </div>
        )}

        {/* Floating Photo Counter Button */}
        <button
          onClick={() => {
            setModalActiveIndex(activeImageIndex);
            setModalViewMode("grid");
            setIsModalOpen(true);
          }}
          className="absolute bottom-5 right-5 z-10 flex items-center gap-1 rounded-full bg-black/60 hover:bg-black/80 px-3 py-1.5 text-[10px] font-medium text-white shadow-md backdrop-blur-md transition-colors border border-white/10"
        >
          <Images className="w-3 h-3" />
          <span>{activeImageIndex + 1} / {displayAllImages.length}</span>
        </button>
      </div>

      {/* Desktop View: Grid Layout (visible on >= md) */}
      <div className="hidden md:grid group relative h-[52vh] min-h-[460px] grid-cols-1 overflow-hidden rounded-[20px] shadow-estate-lg md:h-[64vh] md:grid-cols-4 md:grid-rows-2 md:gap-1.5">
        <div 
          className="relative col-span-1 cursor-pointer overflow-hidden bg-estate-surface md:col-span-2 md:row-span-2"
          onClick={() => {
            setModalActiveIndex(activeImageIndex);
            setModalViewMode("lightbox");
            setIsModalOpen(true);
          }}
        >
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
              onClick={() => {
                if (isAllPhotosTile) {
                  setModalActiveIndex(0);
                  setModalViewMode("grid");
                  setIsModalOpen(true);
                } else {
                  setActiveImageIndex(imageIndex);
                }
              }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      if (navigator.share) {
                        navigator.share({
                          title: title,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }}
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

      {/* Fullscreen Photo Gallery Modal Portal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-white/95 backdrop-blur-md z-20">
            <div>
              <h3 className="font-semibold text-estate-navy text-sm sm:text-base md:text-lg max-w-[200px] sm:max-w-md truncate">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                {modalViewMode === "grid" ? "All Photos" : `Photo ${modalActiveIndex + 1} of ${displayAllImages.length}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {modalViewMode === "lightbox" && (
                <button
                  onClick={() => setModalViewMode("grid")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-xs font-medium text-estate-navy"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Show Grid</span>
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition active:scale-95 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
            {modalViewMode === "grid" ? (
              /* Grid View Mode */
              <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {displayAllImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                      onClick={() => {
                        setModalActiveIndex(idx);
                        setModalViewMode("lightbox");
                      }}
                    >
                      <img
                        src={image}
                        alt={`${title} - Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Lightbox Slideshow Mode */
              <div className="w-full h-full flex flex-col justify-between bg-neutral-950 text-white select-none">
                <div className="relative flex-1 flex items-center justify-center p-4 min-h-0">
                  {/* Left Chevron */}
                  {displayAllImages.length > 1 && (
                    <button
                      onClick={() => setModalActiveIndex((prev) => (prev - 1 + displayAllImages.length) % displayAllImages.length)}
                      className="absolute left-4 z-10 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/10 transition active:scale-95 text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Touch Swipeable Container */}
                  <div
                    className="w-full h-full flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={displayAllImages[modalActiveIndex]}
                      alt={`${title} - Photo ${modalActiveIndex + 1}`}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>

                  {/* Right Chevron */}
                  {displayAllImages.length > 1 && (
                    <button
                      onClick={() => setModalActiveIndex((prev) => (prev + 1) % displayAllImages.length)}
                      className="absolute right-4 z-10 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/10 transition active:scale-95 text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Bottom Thumbnails Scrollbar */}
                <div className="bg-black/80 border-t border-white/10 py-4 px-4 sm:px-6 z-10">
                  <div className="flex gap-2.5 overflow-x-auto justify-start sm:justify-center max-w-[800px] mx-auto pb-1 scrollbar-none">
                    {displayAllImages.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setModalActiveIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                          modalActiveIndex === idx
                            ? "border-white scale-105 opacity-100 shadow-lg"
                            : "border-transparent opacity-40 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`thumb-${idx}`}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = fallbackImage;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
