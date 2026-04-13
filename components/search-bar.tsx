"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { serializeFilters, parseSearchParams } from "@/lib/utils/search-params";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const current = Object.fromEntries(params.entries());
        const filters = parseSearchParams(current);
        const next = serializeFilters({ ...filters, q: value || undefined });
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      }, 300);
    },
    [params, pathname, router]
  );

  function handleClear() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const current = Object.fromEntries(params.entries());
    const filters = parseSearchParams(current);
    const next = serializeFilters({ ...filters, q: undefined });
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <div className="search-bar-wrap">
      <Search size={16} className="search-bar-icon" />
      <input
        className="search-input search-input-icon"
        placeholder="Search actors, tags, or traits..."
        aria-label="Search actors"
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
      />
      {defaultValue && (
        <button className="search-bar-clear" onClick={handleClear} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
