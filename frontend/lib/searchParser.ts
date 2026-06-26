import { SearchSuggestion } from "./searchData";

export interface ParsedQuery {
  beds?: number;
  propertyType?: string;
  city?: string;
  subarea?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: string;
  builder?: string;
  area?: number;
  query: string;
}

const BHK_RE = /\b(\d+)\s*BHK\b/i;
const BEDROOM_RE = /\b(\d+)\s*(?:bed|bedroom|bedrooms)\b/i;
const PROPERTY_TYPES = ["apartment", "villa", "plot", "commercial", "penthouse", "studio", "row house", "farmhouse", "office", "shop", "showroom", "warehouse", "land", "flat"];
const TYPE_RE = new RegExp(`\\b(${PROPERTY_TYPES.join("|")})\\b`, "i");
const PRICE_RANGE_RE = /(?:between|range)\s*([\d,.]+)\s*(?:-|to)\s*([\d,.]+)\s*(lakh|lakhs|lac|lacs|cr|crore|k|thousand)?\b/i;
const UNDER_RE = /(?:under|below|less than|upto|up to|within)\s*([\d,.]+)\s*(lakh|lakhs|lac|lacs|cr|crore|k|thousand)?\b/i;
const ABOVE_RE = /(?:above|over|more than|starting from|min)\s*([\d,.]+)\s*(lakh|lakhs|lac|lacs|cr|crore|k|thousand)?\b/i;
const LISTING_TYPE_RE = /\b(for sale|for rent|sale|rent)\b/i;
const LOCATION_RE = /(?:in|at|near)\s+([a-zA-Z\s,]+?)(?:\s+(?:under|for|above|between|with|upto|up to|within|\d|$)|$)/i;
const SQFT_RE = /\b(\d+)\s*(?:sqft|sq\.ft|sq ft|square feet|sq\.feet)\b/i;
const BUILDER_RE = /\b(lodha|prestige|godrej|oberoi|tata|hiranandani|dosti|runwal|kalpataru|raheja|sunteck|wadhwa|shapoorji|piramal|mahindra|brigade|sobha|puravankara|kolte.patil|kumar properties|vtp)\b/i;

function parseIndianPrice(amount: number, unit?: string): number {
  if (!unit) return amount;
  const u = unit.toLowerCase();
  if (u.startsWith("cr")) return amount * 10000000;
  if (u.startsWith("l")) return amount * 100000;
  if (u.startsWith("k")) return amount * 1000;
  return amount;
}

function normalizeStr(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/,$/, "").trim();
}

function resolveLocation(
  locationStr: string,
  cities: SearchSuggestion[],
  subareas: SearchSuggestion[]
): { city?: string; subarea?: string } {
  const lowerLoc = normalizeStr(locationStr);
  const result: { city?: string; subarea?: string } = {};

  // Sort subareas by length (longest first) for most specific match
  const sortedSubareas = [...subareas].sort(
    (a, b) => b.label.length - a.label.length
  );

  for (const subarea of sortedSubareas) {
    const subLower = subarea.label.toLowerCase();
    if (lowerLoc.includes(subLower)) {
      result.subarea = subarea.label;
      // Remove subarea from location to find city
      const remaining = lowerLoc.replace(subLower, "").trim();
      for (const city of cities) {
        if (remaining.includes(city.label.toLowerCase()) || remaining === "") {
          // If remaining is empty, check if subarea is within a known city
          const cityForSubarea = subarea.category || cities.find(
            (c) => c.label.toLowerCase() === remaining
          );
          if (cityForSubarea && typeof cityForSubarea === "string") {
            // subarea.category might hold city name
            const matchedCity = cities.find(
              (c) => c.label.toLowerCase() === cityForSubarea.toLowerCase()
            );
            if (matchedCity) result.city = matchedCity.label;
          }
          break;
        }
      }
      // Also check if the full location contains a city name
      const matchedCity = cities.find(
        (c) =>
          c.label.toLowerCase() !== subLower &&
          lowerLoc.includes(c.label.toLowerCase())
      );
      if (matchedCity && !result.city) {
        result.city = matchedCity.label;
      }
      return result;
    }
  }

  // No subarea match, try city
  const sortedCities = [...cities].sort(
    (a, b) => b.label.length - a.label.length
  );
  for (const city of sortedCities) {
    if (lowerLoc.includes(city.label.toLowerCase())) {
      result.city = city.label;
      // Check for subarea in the remaining text
      const remaining = lowerLoc.replace(city.label.toLowerCase(), "").trim();
      for (const subarea of sortedSubareas) {
        if (remaining.includes(subarea.label.toLowerCase())) {
          result.subarea = subarea.label;
          break;
        }
      }
      return result;
    }
  }

  // No match found — use raw string as subarea name
  result.subarea = locationStr.trim();
  return result;
}

export function parseSearchQuery(
  input: string,
  searchData?: {
    cities: SearchSuggestion[];
    subareas: SearchSuggestion[];
  }
): ParsedQuery {
  const query = input.trim();
  const result: ParsedQuery = { query };

  let remaining = query;

  // 1. BHK / Bedrooms
  const bhkMatch = remaining.match(BHK_RE) || remaining.match(BEDROOM_RE);
  if (bhkMatch) {
    result.beds = parseInt(bhkMatch[1], 10);
    remaining = remaining.replace(bhkMatch[0], "").trim();
  }

  // 2. Property type
  const typeMatch = remaining.match(TYPE_RE);
  if (typeMatch) {
    const raw = typeMatch[1];
    result.propertyType = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    if (result.propertyType === "Flat") result.propertyType = "Apartment";
    remaining = remaining.replace(typeMatch[0], "").trim();
  }

  // 3. Listing type
  const listingMatch = remaining.match(LISTING_TYPE_RE);
  if (listingMatch) {
    const val = listingMatch[1].toLowerCase();
    result.listingType = val === "sale" || val === "for sale" ? "for-sale" : "for-rent";
    remaining = remaining.replace(listingMatch[0], "").trim();
  }

  // 4. Price range
  const priceMatch = remaining.match(PRICE_RANGE_RE);
  if (priceMatch) {
    result.minPrice = parseIndianPrice(
      parseFloat(priceMatch[1].replace(/,/g, "")),
      priceMatch[3]
    );
    result.maxPrice = parseIndianPrice(
      parseFloat(priceMatch[2].replace(/,/g, "")),
      priceMatch[3]
    );
    remaining = remaining.replace(priceMatch[0], "").trim();
  } else {
    const underMatch = remaining.match(UNDER_RE);
    if (underMatch) {
      result.maxPrice = parseIndianPrice(
        parseFloat(underMatch[1].replace(/,/g, "")),
        underMatch[2]
      );
      remaining = remaining.replace(underMatch[0], "").trim();
    } else {
      const aboveMatch = remaining.match(ABOVE_RE);
      if (aboveMatch) {
        result.minPrice = parseIndianPrice(
          parseFloat(aboveMatch[1].replace(/,/g, "")),
          aboveMatch[2]
        );
        remaining = remaining.replace(aboveMatch[0], "").trim();
      }
    }
  }

  // 5. Area (sqft)
  const sqftMatch = remaining.match(SQFT_RE);
  if (sqftMatch) {
    result.area = parseInt(sqftMatch[1], 10);
    remaining = remaining.replace(sqftMatch[0], "").trim();
  }

  // 6. Builder / project
  const builderMatch = remaining.match(BUILDER_RE);
  if (builderMatch) {
    const raw = builderMatch[1];
    result.builder = raw
      .split(/[.\s]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    remaining = remaining.replace(builderMatch[0], "").trim();
  }

  // 7. Location — handles "in Koregaon Park Pune"
  const locMatch = remaining.match(LOCATION_RE);
  if (locMatch) {
    const locationStr = locMatch[1].trim();
    if (searchData) {
      const resolved = resolveLocation(locationStr, searchData.cities, searchData.subareas);
      result.city = resolved.city;
      result.subarea = resolved.subarea;
    } else {
      result.subarea = locationStr;
    }
    remaining = remaining.replace(locMatch[0], "").trim();
  }

  // 8. Fallback: if remaining text exists and no location was found,
  //    treat the entire remainder as a potential location
  if (remaining && !result.city && !result.subarea) {
    if (searchData) {
      const resolved = resolveLocation(remaining, searchData.cities, searchData.subareas);
      result.city = resolved.city;
      result.subarea = resolved.subarea;
    } else {
      result.subarea = remaining;
    }
  }

  return result;
}

export function buildSearchUrl(parsed: ParsedQuery): string {
  const params = new URLSearchParams();
  if (parsed.beds) params.set("beds", parsed.beds.toString());
  if (parsed.propertyType) params.set("type", parsed.propertyType);
  if (parsed.listingType) params.set("status", parsed.listingType);
  if (parsed.city) params.set("city", parsed.city);
  if (parsed.subarea) params.set("subarea", parsed.subarea);
  if (parsed.minPrice) params.set("minPrice", parsed.minPrice.toString());
  if (parsed.maxPrice) params.set("maxPrice", parsed.maxPrice.toString());
  if (parsed.area) params.set("area", parsed.area.toString());
  if (parsed.builder) params.set("builder", parsed.builder);
  if (parsed.query) params.set("q", parsed.query);

  return `/properties${params.toString() ? `?${params.toString()}` : ""}`;
}
