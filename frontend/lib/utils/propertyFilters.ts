export interface QuestionnaireAnswers {
  category: "residential" | "commercial" | null;
  listingType: "For Sale" | "For Rent" | null;
  budget:
    | "under_50l" | "50l_1cr" | "1cr_2cr" | "2cr_5cr" | "5cr_plus"  // buy
    | "under_10k" | "10k_20k" | "20k_30k" | "30k_50k" | "50k_plus"  // rent
    | "no_preference"
    | null;
  bhk: "1" | "2" | "3" | "4" | "5+" | "no_preference" | null;
  city: string | null;
}

const SESSION_KEY = "property_questionnaire_shown";

const FILTER_PARAMS = new Set([
  "q", "type", "status", "city", "beds", "minPrice", "maxPrice", "category", "subarea", "builder", "area",
]);

export function shouldShowQuestionnaire(searchParams: URLSearchParams): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } catch {
    /* ignore */
  }

  const hasFilters = Array.from(searchParams.entries()).some(
    ([key, val]) => val && FILTER_PARAMS.has(key)
  );
  if (hasFilters) return false;

  return true;
}

export function markQuestionnaireShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    /* ignore */
  }
}

const buyBudgetMap: Record<string, { min?: number; max?: number }> = {
  under_50l: { max: 5000000 },
  "50l_1cr": { min: 5000000, max: 10000000 },
  "1cr_2cr": { min: 10000000, max: 20000000 },
  "2cr_5cr": { min: 20000000, max: 50000000 },
  "5cr_plus": { min: 50000000 },
};

const rentBudgetMap: Record<string, { min?: number; max?: number }> = {
  under_10k: { max: 10000 },
  "10k_20k": { min: 10000, max: 20000 },
  "20k_30k": { min: 20000, max: 30000 },
  "30k_50k": { min: 30000, max: 50000 },
  "50k_plus": { min: 50000 },
};

export function answersToFilters(
  answers: QuestionnaireAnswers
): Record<string, string> {
  const params: Record<string, string> = {};

  if (answers.category) params.category = answers.category;
  if (answers.listingType) params.status = answers.listingType;

  if (answers.budget && answers.budget !== "no_preference") {
    const map = answers.listingType === "For Rent" ? rentBudgetMap : buyBudgetMap;
    const range = map[answers.budget];
    if (range) {
      if (range.min) params.minPrice = range.min.toString();
      if (range.max) params.maxPrice = range.max.toString();
    }
  }

  if (answers.bhk && answers.bhk !== "no_preference") {
    params.beds = answers.bhk.replace("+", "");
  }

  if (answers.city) params.city = answers.city;

  return params;
}
