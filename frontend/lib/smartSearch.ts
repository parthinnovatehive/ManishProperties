import { ParsedQuery } from "./searchParser";
import { SearchSuggestion } from "./searchData";

export interface SmartSuggestion {
  id: string;
  label: string;
  type: "city" | "subarea" | "propertyType" | "builder" | "smart";
  category: string;
  icon: string;
}

export const PROPERTY_TYPES = [
  "Apartment", "Villa", "Plot", "Commercial", "Penthouse",
  "Studio", "Row House", "Farmhouse", "Office Space",
  "Retail Space", "Warehouse", "Industrial", "Showroom",
];

export const BUILDERS = [
  "Lodha", "Prestige", "Godrej", "Oberoi", "Tata Housing",
  "Hiranandani", "Dosti", "Runwal", "Kalpataru", "Raheja",
  "Sunteck", "Wadhwa", "Shapoorji Pallonji", "Piramal Realty",
  "Mahindra Lifespaces", "Brigade", "Sobha", "Puravankara",
  "Kolte-Patil", "Kumar Properties", "VTP Realty", "Amar Group",
];

const RECENT_SEARCHES_KEY = "recent_searches";

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  try {
    const searches = getRecentSearches().filter((s) => s !== query);
    searches.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 5)));
  } catch {
    /* ignore */
  }
}

export function generateSmartSuggestions(
  parsed: ParsedQuery,
  cities: SearchSuggestion[],
  subareas: SearchSuggestion[]
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const seen = new Set<string>();

  // Extract what the user typed before location keywords
  const baseQuery = parsed.query
    .replace(/(?:in|at|near)\s+[a-zA-Z\s]+$/i, "")
    .replace(/\b(?:for sale|for rent|sale|rent)\b/gi, "")
    .trim();

  // Helper to generate a label
  const makeLabel = (parts: string[]) => parts.filter(Boolean).join(" ");

  // Find cities not already in the query
  const lowerQuery = parsed.query.toLowerCase();
  const targetCities = cities.filter(
    (c) => !lowerQuery.includes(c.label.toLowerCase())
  );

  // Generate "3 BHK in Pune" style suggestions
  for (const city of targetCities.slice(0, 4)) {
    const label = baseQuery
      ? `${baseQuery} in ${city.label}`
      : `Properties in ${city.label}`;
    const key = `smart_city_${city.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push({
        id: key,
        label,
        type: "smart",
        category: "Search",
        icon: "🔍",
      });
    }
  }

  // If we have a parsed city but no subarea, suggest subarea combos
  if (parsed.city && subareas.length > 0) {
    const cityLower = parsed.city.toLowerCase();
    const citySubareas = subareas.filter(
      (s) =>
        s.label.toLowerCase().includes(cityLower) ||
        (s.category && s.category.toLowerCase().includes(cityLower))
    );
    for (const subarea of citySubareas.slice(0, 2)) {
      const label = baseQuery
        ? `${baseQuery} in ${subarea.label}, ${parsed.city}`
        : `Properties in ${subarea.label}, ${parsed.city}`;
      const key = `smart_sub_${subarea.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          id: key,
          label,
          type: "smart",
          category: "Search",
          icon: "🔍",
        });
      }
    }
  }

  return suggestions;
}
