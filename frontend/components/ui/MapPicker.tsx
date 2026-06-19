"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  address?: string;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567,
};

const libraries: ("places")[] = ["places"];

export function MapPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat,
  initialLng,
  address,
}: MapPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [searchAddress, setSearchAddress] = useState(address || "");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat && lng) {
      setMarkerPosition({ lat, lng });
    }
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPosition({ lat, lng });
        // Reverse geocode to get address
        getAddressFromCoords(lat, lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please check your browser permissions.");
      }
    );
  }, []);

  const getAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSearchAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (markerPosition) {
      onLocationSelect(markerPosition.lat, markerPosition.lng, searchAddress);
      onClose();
    }
  }, [markerPosition, searchAddress, onLocationSelect, onClose]);

  const handleSearchAddress = useCallback(async () => {
    if (!searchAddress.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setMarkerPosition({ lat: location.lat, lng: location.lng });
        setSearchAddress(data.results[0].formatted_address);
      } else {
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      alert("Error searching address. Please try again.");
    }
  }, [searchAddress]);

  if (!isOpen) return null;

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <p className="text-red-600">Error loading Google Maps. Please check your API key.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-estate-navy" />
          <p className="mt-2 text-estate-muted">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-estate-border">
          <h3 className="text-lg font-bold text-estate-navy">Select Location</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search address..."
              className="flex-1 px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
            />
            <button
              onClick={handleSearchAddress}
              className="px-4 py-2 bg-estate-navy text-white rounded-lg hover:bg-estate-navy-mid transition"
            >
              Search
            </button>
          </div>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={markerPosition || defaultCenter}
            zoom={14}
            onClick={onMapClick}
          >
            {markerPosition && <Marker position={markerPosition} draggable />}
          </GoogleMap>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUseCurrentLocation}
              className="flex-1 px-4 py-2 border border-estate-border rounded-lg hover:bg-gray-50 transition font-medium"
            >
              📍 Use My Location
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!markerPosition}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                markerPosition
                  ? "bg-estate-navy text-white hover:bg-estate-navy-mid"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Location
            </button>
          </div>

          {markerPosition && (
            <p className="mt-2 text-xs text-estate-muted">
              Selected: {searchAddress || `Lat: ${markerPosition.lat.toFixed(6)}, Lng: ${markerPosition.lng.toFixed(6)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}