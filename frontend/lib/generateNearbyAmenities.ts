import { estateApi } from "./api";

export async function generateNearbyAmenities(
  lat: number,
  lng: number
) {
  try {
    const amenities = await estateApi.properties.fetchAmenities(lat, lng, 2000);
    return amenities;
  } catch (error) {
    console.error("Failed to fetch amenities from Google Places API:", error);
    throw error;
  }
}