import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ProfileCard } from "@/components/profile-card";
import { SearchBar } from "@/components/search-bar";
import { getActorsForTalent, getRolesByCd } from "@/lib/supabase/queries";
import { parseSearchParams, hasActiveFilters } from "@/lib/utils/search-params";
import { createClient } from "@/lib/supabase/server";
import { Users, Camera, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import type { ActorProfile, Role } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

/** Score an actor against a role's requirements. Higher = better match. */
function scoreActor(actor: ActorProfile, role: Role): number {
  let score = 0;

  // Age range match
  if (actor.age && role.age_min && role.age_max) {
    if (actor.age >= role.age_min && actor.age <= role.age_max) score += 3;
  }

  // Gender match
  if (actor.gender && role.gender?.length) {
    if (role.gender.some((g) => g.toLowerCase() === actor.gender?.toLowerCase())) score += 2;
  }

  // Location match
  if (actor.location && role.location) {
    if (actor.location.toLowerCase().includes(role.location.toLowerCase())) score += 2;
  }

  // Skills/tags keyword overlap with role description
  if (role.description) {
    const desc = role.description.toLowerCase();
    const actorTerms = [...(actor.skills ?? []), ...(actor.tags ?? []), ...(actor.talent_type ?? [])];
    for (const term of actorTerms) {
      if (desc.includes(term.toLowerCase())) score += 1;
    }
  }

  // Availability bonus
  if (actor.availability === "Available") score += 1;

  // Profile completeness bonus (headshot + bio)
  if (actor.headshot_url) score += 1;
  if (actor.bio) score += 1;

  return score;
}

export default async function TalentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseSearchParams(rawParams);

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  // Get creator's most recently active role for match scoring
  let activeRole: Role | null = null;
  if (authData.user) {
    const roles = await getRolesByCd(authData.user.id);
    const openRoles = roles.filter((r) => r.status === "open");
    if (openRoles.length > 0) activeRole = openRoles[0];
  }

  const [allActors, filtered] = await Promise.all([
    getActorsForTalent(),
    hasActiveFilters(filters) ? getActorsForTalent(filters) : null,
  ]);

  let actors = filtered ?? allActors;
  const totalCount = allActors.length;
  const withHeadshot = allActors.filter((a) => a.headshot_url).length;
  const isFiltered = hasActiveFilters(filters);

  // Sort by match score if there's an active role
  if (activeRole && !isFiltered) {
    actors = [...actors].sort(
      (a, b) => scoreActor(b, activeRole!) - scoreActor(a, activeRole!)
    );
  }

  const hasNoRoles = !activeRole && !authData.user;

  return (
    <AppShell
      eyebrow="Talent Discovery"
      title={activeRole ? `Matched for "${activeRole.title}"` : "Find your cast"}
      actions={
        <Suspense>
          <SearchBar defaultValue={filters.q} />
        </Suspense>
      }
    >
      <div className="dashboard-main" style={{ maxWidth: "100%" }}>
        {/* Post-a-role nudge when no active role */}
        {authData.user && !activeRole && (
          <div className="talent-nudge-card">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Post a role to see top matches</p>
              <p className="muted-copy" style={{ margin: 0 }}>
                We'll rank profiles against your casting requirements automatically.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <Link href="/roles/new" className="primary-button" style={{ fontSize: "0.88rem", padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} /> Post a Role
              </Link>
            </div>
          </div>
        )}

        {/* Stats strip */}
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
            <strong>{isFiltered ? `${actors.length} / ${totalCount}` : totalCount}</strong>
            <span>{isFiltered ? "matching filters" : activeRole ? "ranked by match" : "profiles available"}</span>
          </div>
        </div>

        {/* Actor grid */}
        {actors.length === 0 ? (
          <div className="panel discovery-empty">
            {isFiltered ? (
              <>
                <p className="eyebrow">No matches</p>
                <h3>No actors match your filters</h3>
                <p className="muted-copy">Try removing a filter or broadening your search.</p>
                <a href="/talent" className="ghost-button" style={{ marginTop: 20, display: "inline-block" }}>Clear all filters</a>
              </>
            ) : (
              <>
                <p className="eyebrow">No actors yet</p>
                <h3>The network is waiting</h3>
                <p className="muted-copy">Actors who complete their profiles will appear here.</p>
              </>
            )}
          </div>
        ) : (
          <section className="card-grid">
            {actors.map((actor, index) => (
              <ProfileCard
                key={actor.id}
                actor={actor}
                featured={index === 0 && !isFiltered && !!activeRole}
              />
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
