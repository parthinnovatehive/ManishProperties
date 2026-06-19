import { calculateDistance } from "./calculate-distance";

export async function generateNearbyAmenities(
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
);
out body;
`;

  const response = await fetch(
  "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: query,
  }
);

  const text = await response.text();

console.log("OVERPASS RESPONSE:", text);

if (!response.ok) {
  throw new Error(`Overpass Error: ${response.status}`);
}

let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error(
    "Overpass API returned non-JSON response"
  );
}

  const elements = data.elements || [];

  function nearest(
    key: string,
    field: string
  ) {
    const matches = elements.filter(
      (x: any) =>
        x.tags?.[field] === key
    );

    if (!matches.length) return null;

    let nearestItem = matches[0];
    let minDistance = Infinity;

    matches.forEach((item: any) => {
      const distance = calculateDistance(
        lat,
        lng,
        item.lat,
        item.lon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestItem = item;
      }
    });

    const mins = Math.ceil(
      (minDistance / 30) * 60
    );

    return {
      name:
        nearestItem.tags?.name ||
        "Nearby Location",
      distance: Number(
        minDistance.toFixed(1)
      ),
      travelTime: `${mins} min`,
    };
  }

  return {
    hospital: nearest("hospital", "amenity"),
    school: nearest("school", "amenity"),
    supermarket: nearest("supermarket", "shop"),
    petrol: nearest("fuel", "amenity"),
    station: nearest("station", "railway"),
    bank: nearest("bank", "amenity"),
    restaurant: nearest("restaurant", "amenity"),
    atm: nearest("atm", "amenity"),
    pharmacy: nearest("pharmacy", "amenity"),
    busStation: nearest("bus_station", "amenity"),
    college: nearest("college", "amenity"),
    park: nearest("park", "leisure"),
  };
}