import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ProfileCard } from "@/components/profile-card";
import { SearchBar } from "@/components/search-bar";
import { getActorsForDiscovery } from "@/lib/supabase/queries";
import { parseSearchParams, hasActiveFilters } from "@/lib/utils/search-params";
import { Users, Camera, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseSearchParams(rawParams);

  // Total unfiltered count for the stats strip
  const [allActors, filtered] = await Promise.all([
    getActorsForDiscovery(),
    hasActiveFilters(filters) ? getActorsForDiscovery(filters) : null,
  ]);

  const actors = filtered ?? allActors;
  const totalCount = allActors.length;
  const withHeadshot = allActors.filter((a) => a.headshot_url).length;
  const isFiltered = hasActiveFilters(filters);

  return (
    <AppShell
      eyebrow="Talent Network"
      title="Find talent built around watchable signal"
      actions={
        <Suspense>
          <SearchBar defaultValue={filters.q} />
        </Suspense>
      }
    >
      <section className="dashboard-grid">
        <Suspense>
          <FilterSidebar activeFilters={filters} />
        </Suspense>

        <div className="dashboard-main">
          {/* Live stats */}
          <div className="stats-strip">
            <div>
              <Users size={20} className="stats-icon" />
              <strong>{totalCount}</strong>
              <span>actors in network</span>
            </div>
            <div>
              <Camera size={20} className="stats-icon" />
              <strong>{withHeadshot}</strong>
              <span>with headshots</span>
            </div>
            <div>
              <CheckCircle size={20} className="stats-icon" />
              <strong>
                {isFiltered
                  ? `${actors.length} / ${totalCount}`
                  : totalCount}
              </strong>
              <span>{isFiltered ? "matching filters" : "profiles available"}</span>
            </div>
          </div>

          {/* Actor grid or empty state */}
          {actors.length === 0 ? (
            <div className="panel discovery-empty">
              {isFiltered ? (
                <>
                  <p className="eyebrow">No matches</p>
                  <h3>No actors match your filters</h3>
                  <p className="muted-copy">
                    Try removing a filter or broadening your search.
                  </p>
                  <a href="/discovery" className="ghost-button" style={{ marginTop: 20, display: "inline-block" }}>
                    Clear all filters
                  </a>
                </>
              ) : (
                <>
                  <p className="eyebrow">No actors yet</p>
                  <h3>The network is waiting</h3>
                  <p className="muted-copy">
                    Actors who sign up, complete their profiles, and mark themselves available
                    will appear here. Invite talent to join the platform to get started.
                  </p>
                </>
              )}
            </div>
          ) : (
            <section className="card-grid">
              {actors.map((actor, index) => (
                <ProfileCard
                  key={actor.id}
                  actor={actor}
                  featured={index === 0 && !isFiltered}
                />
              ))}
            </section>
          )}
        </div>
      </section>
    </AppShell>
  );
}
