export async function getNearbyAmenities(
  lat: number,
  lng: number
) {
  const radius = 3000;

 const query = `
[out:json];
(
  node["amenity"="school"](around:${radius},${lat},${lng});
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  node["shop"="supermarket"](around:${radius},${lat},${lng});
  node["railway"="station"](around:${radius},${lat},${lng});
  node["amenity"="fuel"](around:${radius},${lat},${lng});

  node["amenity"="bank"](around:${radius},${lat},${lng});
  node["amenity"="restaurant"](around:${radius},${lat},${lng});
  node["amenity"="atm"](around:${radius},${lat},${lng});
  node["amenity"="pharmacy"](around:${radius},${lat},${lng});
  node["amenity"="bus_station"](around:${radius},${lat},${lng});
  node["amenity"="college"](around:${radius},${lat},${lng});

  node["leisure"="park"](around:${radius},${lat},${lng});

  node["aeroway"="aerodrome"](around:20000,${lat},${lng});
);
out body;
`;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: query,
    }
  );

  if (!response.ok) {
    console.error(
      "Overpass Error:",
      await response.text()
    );
    return [];
  }

  const data = await response.json();

  return data.elements || [];
}