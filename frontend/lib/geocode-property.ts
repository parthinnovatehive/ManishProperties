/**
 * Geocodes a location string using the free Nominatim OpenStreetMap API.
 * Tries multiple query variations, from most to least specific, until one succeeds.
 * Returns { lat, lng } or null if all attempts fail.
 */
export async function geocodeProperty(
  location: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    location,
    `${location}, India`,
    city ? `${city}, India` : null,
  ].filter((s): s is string => typeof s === "string" && s.trim() !== "");

  for (const q of queries) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        {
          headers: {
            "Accept-Language": "en",
            // Nominatim policy requires a User-Agent
            "User-Agent": "ManishProperties/1.0 (property listing app)",
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data?.length) {
        return {
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
        };
      }
    } catch (err) {
      console.error("Geocoding error for query:", q, err);
    }
  }

  return null;
}