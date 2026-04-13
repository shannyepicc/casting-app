export type SearchFilters = {
  q?: string;
  type?: string[];    // talent types (multi)
  age?: string;       // "18-24" | "24-30" | "27-34" | "30-42"
  gender?: string;    // "Woman" | "Man" | "Non-binary"
  location?: string;  // city string
  tags?: string[];    // skills/tags (multi)
};

const AGE_RANGES: Record<string, { min: number; max: number }> = {
  "18-24": { min: 18, max: 24 },
  "24-30": { min: 24, max: 30 },
  "27-34": { min: 27, max: 34 },
  "30-42": { min: 30, max: 42 },
};

export function getAgeRange(age: string): { min: number; max: number } | null {
  return AGE_RANGES[age] ?? null;
}

/** Parse Next.js searchParams into a SearchFilters object */
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>
): SearchFilters {
  const getString = (key: string) => {
    const v = params[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };

  const getArray = (key: string): string[] | undefined => {
    const v = params[key];
    if (!v) return undefined;
    const raw = typeof v === "string" ? v : v[0];
    const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  };

  return {
    q:        getString("q"),
    type:     getArray("type"),
    age:      getString("age"),
    gender:   getString("gender"),
    location: getString("location"),
    tags:     getArray("tags"),
  };
}

/** Serialize a SearchFilters object back into a URLSearchParams string */
export function serializeFilters(filters: SearchFilters): string {
  const params = new URLSearchParams();

  if (filters.q)        params.set("q",        filters.q);
  if (filters.type?.length)     params.set("type",     filters.type.join(","));
  if (filters.age)      params.set("age",      filters.age);
  if (filters.gender)   params.set("gender",   filters.gender);
  if (filters.location) params.set("location", filters.location);
  if (filters.tags?.length)     params.set("tags",     filters.tags.join(","));

  return params.toString();
}

/** Returns true if any filter is active */
export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    filters.q ||
    filters.type?.length ||
    filters.age ||
    filters.gender ||
    filters.location ||
    filters.tags?.length
  );
}

/** Count how many filter categories are active (not counting text search) */
export function activeFilterCount(filters: SearchFilters): number {
  let count = 0;
  if (filters.type?.length)  count++;
  if (filters.age)           count++;
  if (filters.gender)        count++;
  if (filters.location)      count++;
  if (filters.tags?.length)  count++;
  return count;
}
