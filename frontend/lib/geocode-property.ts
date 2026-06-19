export async function geocodeProperty(
  location: string,
  city: string
) {
  const queries = [
  location,
  `${location}, India`,
  city ? `${city}, India` : null,
].filter(Boolean);

  for (const q of queries) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          q
        )}`,
        {
          headers: {
            "Accept-Language": "en",
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
      console.error("Geocoding error:", err);
    }
  }

  return null;
}