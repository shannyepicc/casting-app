import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { getOpportunities } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROJECT_TYPES = [
  { value: "all",         label: "All Types" },
  { value: "short_film",  label: "Short Film" },
  { value: "feature",     label: "Feature Film" },
  { value: "commercial",  label: "Commercial" },
  { value: "tv",          label: "TV / Streaming" },
  { value: "youtube",     label: "YouTube" },
  { value: "music_video", label: "Music Video" },
  { value: "theatre",     label: "Theatre" },
  { value: "brand",       label: "Brand Work" },
  { value: "other",       label: "Other" },
];

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const typeFilter = params.type ?? "all";
  const locationFilter = params.location ?? "";

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  let appliedRoleIds: string[] = [];
  if (authData.user) {
    const { data: apps } = await supabase
      .from("applications")
      .select("role_id")
      .eq("actor_id", authData.user.id);
    appliedRoleIds = (apps ?? []).map((a) => a.role_id);
  }

  const posts = await getOpportunities("newest", locationFilter || undefined, typeFilter);

  return (
    <AppShell
      eyebrow="Casting Calls"
      title="Open opportunities"
      actions={
        <Suspense>
          <OpportunityFilters activeType={typeFilter} activeLocation={locationFilter} />
        </Suspense>
      }
    >
      <div className="feed-layout">
        {/* Filter pills */}
        <div className="opp-filter-row">
          {PROJECT_TYPES.map((t) => (
            <a
              key={t.value}
              href={`/opportunities?type=${t.value}${locationFilter ? `&location=${locationFilter}` : ""}`}
              className={`opp-filter-pill${typeFilter === t.value ? " active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="panel feed-empty">
            <p className="eyebrow">No results</p>
            <h3>No open roles match your filters</h3>
            <p className="muted-copy">Try a different type or check back soon.</p>
            <a href="/opportunities" className="ghost-button" style={{ marginTop: 16, display: "inline-block" }}>
              Clear filters
            </a>
          </div>
        ) : (
          <div className="feed-posts">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                appliedRoleIds={appliedRoleIds}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Simple server-side filter display (no JS required)
function OpportunityFilters({
  activeType,
  activeLocation,
}: {
  activeType: string;
  activeLocation: string;
}) {
  return (
    <form method="GET" action="/opportunities" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        name="location"
        defaultValue={activeLocation}
        placeholder="Filter by location…"
        className="search-input"
        style={{ width: 180 }}
      />
      <input type="hidden" name="type" value={activeType} />
      <button type="submit" className="ghost-button" style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
        Filter
      </button>
    </form>
  );
}
