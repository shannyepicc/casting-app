"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  parseSearchParams,
  serializeFilters,
  hasActiveFilters,
  activeFilterCount,
  type SearchFilters,
} from "@/lib/utils/search-params";

const TALENT_TYPES = [
  "Actor", "Host / Presenter", "Dancer", "Musician",
  "Voice Artist", "Model", "Content Creator",
];

const AGE_RANGES = ["18-24", "24-30", "27-34", "30-42"];
const GENDERS    = ["Any", "Male", "Female", "Non-binary"];
const LOCATIONS  = ["Los Angeles", "New York", "San Francisco", "Remote"];
const TAGS       = ["Comedy", "Drama", "Improv", "Action", "Voice"];

export function FilterSidebar({ activeFilters }: { activeFilters: SearchFilters }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  function update(changes: Partial<SearchFilters>) {
    const next = serializeFilters({ ...activeFilters, ...changes });
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function toggleMulti(field: "type" | "tags", value: string) {
    const current = activeFilters[field] ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [field]: updated.length ? updated : undefined });
  }

  function toggleSingle(field: "age" | "gender" | "location", value: string) {
    // clicking the active value deselects it
    const isAny = field === "gender" && value === "Any";
    const current = activeFilters[field];
    update({ [field]: current === value || isAny ? undefined : value });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const count = activeFilterCount(activeFilters);
  const anyActive = hasActiveFilters(activeFilters);

  return (
    <section className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title-row">
          <div>
            <p className="eyebrow">Filter Stack</p>
            <h3>Find talent fast</h3>
          </div>
          {count > 0 && (
            <span className="filter-count-badge">{count} active</span>
          )}
        </div>
        <span>Narrow by type, traits, and location.</span>
      </div>

      {anyActive && (
        <button className="filter-clear-btn" onClick={clearAll}>
          <X size={13} />
          Clear all filters
        </button>
      )}

      {/* ── Talent Type ─────────────────────────────────── */}
      <div className="filter-group">
        <h4>Talent Type</h4>
        <div className="filter-pills">
          {TALENT_TYPES.map((item) => {
            const active = (activeFilters.type ?? []).includes(item);
            return (
              <button
                key={item}
                className={`filter-pill${active ? " filter-pill--active" : ""}`}
                onClick={() => toggleMulti("type", item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Age Range ───────────────────────────────────── */}
      <div className="filter-group">
        <h4>Age Range</h4>
        <div className="filter-pills">
          {AGE_RANGES.map((item) => {
            const active = activeFilters.age === item;
            return (
              <button
                key={item}
                className={`filter-pill${active ? " filter-pill--active" : ""}`}
                onClick={() => toggleSingle("age", item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Gender ──────────────────────────────────────── */}
      <div className="filter-group">
        <h4>Gender</h4>
        <div className="filter-pills">
          {GENDERS.map((item) => {
            const active = item === "Any"
              ? !activeFilters.gender
              : activeFilters.gender === item;
            return (
              <button
                key={item}
                className={`filter-pill${active ? " filter-pill--active" : ""}`}
                onClick={() => toggleSingle("gender", item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Location ────────────────────────────────────── */}
      <div className="filter-group">
        <h4>Location</h4>
        <div className="filter-pills">
          {LOCATIONS.map((item) => {
            const active = activeFilters.location === item;
            return (
              <button
                key={item}
                className={`filter-pill${active ? " filter-pill--active" : ""}`}
                onClick={() => toggleSingle("location", item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tags / Skills ───────────────────────────────── */}
      <div className="filter-group">
        <h4>Tags</h4>
        <div className="filter-pills">
          {TAGS.map((item) => {
            const active = (activeFilters.tags ?? []).includes(item);
            return (
              <button
                key={item}
                className={`filter-pill${active ? " filter-pill--active" : ""}`}
                onClick={() => toggleMulti("tags", item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
