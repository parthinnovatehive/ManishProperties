"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useLoadScript, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { apiClient } from "@/lib/api/client";

const libraries: ("places")[] = ["places"];

interface Amenity {
  name: string;
  address: string;
  distance: number;
  rating?: number;
  total_ratings?: number;
}

interface Amenities {
  hospital: Amenity[];
  school: Amenity[];
  supermarket: Amenity[];
  petrol: Amenity[];
  station: Amenity[];
  bank: Amenity[];
  restaurant: Amenity[];
  atm: Amenity[];
  pharmacy: Amenity[];
  busStation: Amenity[];
  college: Amenity[];
  park: Amenity[];
  airport: Amenity[];
  mall: Amenity[];
  gym: Amenity[];
}

interface PropertyAmenitiesMapProps {
  lat: number;
  lng: number;
  onAmenitiesFetched: (amenities: Amenities) => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
};

export function PropertyAmenitiesMap({ lat, lng, onAmenitiesFetched }: PropertyAmenitiesMapProps) {
  const [amenities, setAmenities] = useState<Amenities | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<{ name: string; details: Amenity } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat, lng });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.post<{ success: boolean; data: Amenities }>('/api/properties/fetch-amenities', {
        lat,
        lng,
        radius: 2000,
      });

      if (response.success && response.data) {
        setAmenities(response.data);
        onAmenitiesFetched(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch amenities:', error);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, onAmenitiesFetched]);

  useEffect(() => {
    if (isLoaded && lat && lng) {
      fetchAmenities();
    }
  }, [isLoaded, lat, lng, fetchAmenities]);

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 rounded-xl text-red-600">
        Error loading Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-estate-navy" />
        <span className="ml-2">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-estate-navy">Nearby Amenities</h3>
        <button
          type="button"
          onClick={fetchAmenities}
          disabled={loading}
          className="px-4 py-2 text-sm bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
              Fetching...
            </>
          ) : (
            'Refresh Amenities'
          )}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-estate-border">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={14}
          options={mapOptions}
        >
          {/* Property Marker */}
          <Marker
            position={mapCenter}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(40, 40),
            }}
          />

          {/* Amenity Markers - Show top 3 from each category */}
          {amenities && Object.entries(amenities).map(([category, items]) => 
            items.slice(0, 3).map((item: Amenity, index: number) => {
              // We need to geocode the address to get coordinates
              // For now, we'll use a placeholder marker
              // In production, you'd use Google Places API to get coordinates
              return (
                <Marker
                  key={`${category}-${index}`}
                  position={{
                    lat: lat + (Math.random() - 0.5) * 0.02,
                    lng: lng + (Math.random() - 0.5) * 0.02,
                  }}
                  onClick={() => setSelectedAmenity({ name: category, details: item })}
                />
              );
            })
          )}

          {selectedAmenity && (
            <InfoWindow
              position={{
                lat: lat + (Math.random() - 0.5) * 0.02,
                lng: lng + (Math.random() - 0.5) * 0.02,
              }}
              onCloseClick={() => setSelectedAmenity(null)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-sm capitalize">{selectedAmenity.name}</h4>
                <p className="text-sm text-gray-600">{selectedAmenity.details.name}</p>
                <p className="text-xs text-gray-500">{selectedAmenity.details.address}</p>
                <p className="text-xs text-gray-500">
                  Distance: {selectedAmenity.details.distance} km
                </p>
                {selectedAmenity.details.rating && (
                  <p className="text-xs text-amber-500">
                    Rating: {selectedAmenity.details.rating} ⭐
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Amenities List */}
      {amenities && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
          {Object.entries(amenities).map(([category, items]) => (
            items.length > 0 && (
              <div key={category} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-estate-navy capitalize mb-1">
                  {category}
                </p>
                <div className="space-y-1">
                  {items.slice(0, 3).map((item: Amenity, index: number) => (
                    <div key={index} className="text-xs text-gray-600">
                      {item.name} ({item.distance}km)
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}