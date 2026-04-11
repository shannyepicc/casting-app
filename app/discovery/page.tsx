import { ActorCard } from "@/components/actor-card";
import { AppShell } from "@/components/app-shell";
import { FilterSidebar } from "@/components/filter-sidebar";
import { actors, featuredRole } from "@/lib/mock-data";

export default function DiscoveryPage() {
  return (
    <AppShell
      eyebrow="Casting Dashboard"
      title="Actor discovery built around watchable signal"
      actions={
        <>
          <input className="search-input" placeholder="Search actors, tags, or traits..." aria-label="Search actors" />
          <button className="ghost-button">Sort: Relevance</button>
        </>
      }
    >
      <section className="dashboard-grid">
        <FilterSidebar />

        <div className="dashboard-main">
          <section className="hero-banner">
            <div>
              <p className="eyebrow">Featured Role</p>
              <h3>{featuredRole.title}</h3>
              <p>{featuredRole.description}</p>
            </div>
            <div className="hero-banner-meta">
              <span>{featuredRole.location}</span>
              <span>{featuredRole.ageRange}</span>
              <span>{featuredRole.rate}</span>
            </div>
          </section>

          <div className="stats-strip">
            <div>
              <strong>247</strong>
              <span>active actors</span>
            </div>
            <div>
              <strong>39</strong>
              <span>ready-to-watch clips</span>
            </div>
            <div>
              <strong>12</strong>
              <span>new matches today</span>
            </div>
          </div>

          <section className="card-grid">
            {actors.map((actor, index) => (
              <ActorCard key={actor.id} actor={actor} featured={index === 0} />
            ))}
          </section>
        </div>
      </section>
    </AppShell>
  );
}
