"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Loader2, X, LocateFixed, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LeafletMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  address?: string;
}

const defaultCenter: [number, number] = [18.5204, 73.8567];

// Fix Leaflet default icon issue with bundlers
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({ markerPosition }: { markerPosition: [number, number] | null }) {
  const map = useMap();
  const hasSet = useRef(false);

  useEffect(() => {
    if (markerPosition && !hasSet.current) {
      map.setView(markerPosition, 14);
      hasSet.current = true;
    }
  }, [markerPosition, map]);

  return null;
}

export function LeafletMapPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat,
  initialLng,
  address,
}: LeafletMapPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [searchAddress, setSearchAddress] = useState(address || "");
  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    getAddressFromCoords(lat, lng);
  }, []);

  const getAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "ManishProperties/1.0",
          },
        }
      );
      const data = await response.json();
      if (data.display_name) {
        setSearchAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error getting address:", error);
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
        setMarkerPosition([lat, lng]);
        getAddressFromCoords(lat, lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please check your browser permissions.");
      }
    );
  }, [getAddressFromCoords]);

  const handleSearchAddress = useCallback(async () => {
    if (!searchAddress.trim()) return;

    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchAddress)}`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "ManishProperties/1.0",
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        setMarkerPosition([lat, lng]);
        setSearchAddress(data[0].display_name);
      } else {
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      alert("Error searching address. Please try again.");
    } finally {
      setLoadingAddress(false);
    }
  }, [searchAddress]);

  const handleConfirmLocation = useCallback(() => {
    if (markerPosition) {
      onLocationSelect(markerPosition[0], markerPosition[1], searchAddress);
      onClose();
    }
  }, [markerPosition, searchAddress, onLocationSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Select Location</h3>
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
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
            />
            <button
              onClick={handleSearchAddress}
              disabled={loadingAddress}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium flex items-center gap-1"
            >
              {loadingAddress ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "400px" }}>
            <MapContainer
              center={markerPosition || defaultCenter}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {markerPosition && <Marker position={markerPosition} draggable={true} />}
              <FitBounds markerPosition={markerPosition} />
            </MapContainer>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUseCurrentLocation}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center justify-center gap-1"
            >
              <LocateFixed size={14} /> Use My Location
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!markerPosition}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-sm ${
                markerPosition
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Location
            </button>
          </div>

          {markerPosition && (
            <p className="mt-2 text-xs text-gray-500">
              Selected: {searchAddress || `Lat: ${markerPosition[0].toFixed(6)}, Lng: ${markerPosition[1].toFixed(6)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
