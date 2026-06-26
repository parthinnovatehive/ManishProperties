import { estateApi } from "@/lib/api";

export interface SearchSuggestion {
  id: string;
  label: string;
  type: "city" | "subarea" | "propertyType";
  category?: string;
}

const propertyTypes = [
  "Apartment", "Villa", "Plot", "Commercial", "Penthouse",
  "Studio", "Row House", "Farmhouse", "Office Space",
  "Retail Space", "Warehouse", "Industrial", "Showroom",
];

let cachedData: {
  cities: SearchSuggestion[];
  subareas: SearchSuggestion[];
  propertyTypes: SearchSuggestion[];
} | null = null;

export async function fetchSearchData(): Promise<{
  cities: SearchSuggestion[];
  subareas: SearchSuggestion[];
  propertyTypes: SearchSuggestion[];
}> {
  if (cachedData) return cachedData;

  try {
    const [citiesData, subareasData] = await Promise.all([
      estateApi.cities.list<any>(),
      estateApi.content.subareas.list<any>(),
    ]);

    const cities: SearchSuggestion[] = (citiesData || [])
      .filter((c: any) => c.status === "active")
      .map((c: any) => ({
        id: c.id,
        label: c.name,
        type: "city" as const,
        category: "City",
      }));

    const subareas: SearchSuggestion[] = (subareasData || [])
      .filter((s: any) => s.status === "active")
      .map((s: any) => ({
        id: s.id,
        label: s.name,
        type: "subarea" as const,
        category: "Subarea",
      }));

    const types: SearchSuggestion[] = propertyTypes.map((type) => ({
      id: `type_${type.toLowerCase().replace(/\s+/g, "_")}`,
      label: type,
      type: "propertyType" as const,
      category: "Property Type",
    }));

    cachedData = { cities, subareas, propertyTypes: types };
    return cachedData;
  } catch (error) {
    console.error("Failed to fetch search data:", error);
    return { cities: [], subareas: [], propertyTypes: [] };
  }
}

export function filterSuggestions(
  query: string,
  data: SearchSuggestion[]
): SearchSuggestion[] {
  if (!query || query.length < 1) return [];
  const lowerQuery = query.toLowerCase();
  return data
    .filter((item) => item.label.toLowerCase().includes(lowerQuery))
    .slice(0, 8);
}
