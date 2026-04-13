import { AppShell } from "@/components/app-shell";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ProfileCard } from "@/components/profile-card";
import { getActorsForDiscovery } from "@/lib/supabase/queries";

// Always fetch fresh — new actors should show up immediately
export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const actors = await getActorsForDiscovery();

  const withHeadshot = actors.filter((a) => a.headshot_url).length;

  return (
    <AppShell
      eyebrow="Talent Network"
      title="Find talent built around watchable signal"
      actions={
        <input
          className="search-input"
          placeholder="Search actors, tags, or traits..."
          aria-label="Search actors"
        />
      }
    >
      <section className="dashboard-grid">
        <FilterSidebar />

        <div className="dashboard-main">
          {/* Live stats */}
          <div className="stats-strip">
            <div>
              <strong>{actors.length}</strong>
              <span>actors in network</span>
            </div>
            <div>
              <strong>{withHeadshot}</strong>
              <span>with headshots</span>
            </div>
            <div>
              <strong>{actors.length}</strong>
              <span>profiles available</span>
            </div>
          </div>

          {/* Actor grid or empty state */}
          {actors.length === 0 ? (
            <div className="panel discovery-empty">
              <p className="eyebrow">No actors yet</p>
              <h3>The network is waiting</h3>
              <p className="muted-copy">
                Actors who sign up, complete their profiles, and mark themselves available will appear
                here. Invite talent to join the platform to get started.
              </p>
            </div>
          ) : (
            <section className="card-grid">
              {actors.map((actor, index) => (
                <ProfileCard key={actor.id} actor={actor} featured={index === 0} />
              ))}
            </section>
          )}
        </div>
      </section>
    </AppShell>
  );
}
