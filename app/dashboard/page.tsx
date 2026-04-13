import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RoleCard } from "@/components/role-card";
import { CompletenessCard } from "@/components/completeness-card";
import { createClient } from "@/lib/supabase/server";
import { getRoles, getApplicationsByActor } from "@/lib/supabase/queries";
import { getCompleteness } from "@/lib/utils/profile-completeness";
import { isEffectivelyClosed } from "@/components/role-card";
import { Upload, ArrowRight, FileText, Clapperboard } from "lucide-react";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const COMP_LABELS: Record<string, string> = {
  paid: "Paid", deferred: "Deferred", copy_credit: "Copy / Credit", unpaid: "Unpaid",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  short_film: "Short Film", feature: "Feature Film", youtube: "YouTube",
  music_video: "Music Video", commercial: "Commercial", brand: "Brand / Sponsored",
  tv: "TV / Streaming", web_series: "Web Series", podcast: "Podcast",
  photography: "Photography", gaming: "Gaming / Streaming", theatre: "Theatre", other: "Other",
};

function getFirstName(fullName: string | null): string {
  if (!fullName) return "there";
  return fullName.split(" ")[0];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");
  if (profile.account_type === "creator") redirect("/profile/roles");

  // Fetch everything in parallel
  const [allRoles, applications, mediaResult] = await Promise.all([
    getRoles(),
    getApplicationsByActor(user.id),
    supabase
      .from("media")
      .select("id", { count: "exact" })
      .eq("owner_id", user.id)
      .eq("status", "ready")
      .eq("is_public", true),
  ]);

  const mediaCount = mediaResult.count ?? 0;
  const completeness = getCompleteness(profile as Partial<Profile>, mediaCount);

  // Open, non-expired roles only — max 6
  const openRoles = allRoles
    .filter((r) => !isEffectivelyClosed(r))
    .slice(0, 6);

  const firstName = getFirstName(profile.full_name);
  const greeting = getGreeting();
  const profileComplete = completeness.score >= 75;

  return (
    <AppShell
      eyebrow="Actor Dashboard"
      title={`${greeting}, ${firstName}.`}
      actions={
        <Link href="/profile/edit" className="ghost-button">
          Edit Profile
        </Link>
      }
    >
      <div className="dashboard-actor">

        {/* ── Top strip ─────────────────────────────────────────── */}
        <p className="dashboard-sub">
          {profileComplete
            ? "Your profile is live and searchable by casting directors."
            : "Complete your profile to start getting discovered."}
        </p>

        <div className="dashboard-actor-grid">

          {/* ── Left column ─────────────────────────────────────── */}
          <div className="dashboard-actor-main">

            {/* Matched roles */}
            <section>
              <div className="panel-heading" style={{ marginBottom: 16 }}>
                <div>
                  <p className="eyebrow">Matched Roles</p>
                  <h3>Open right now</h3>
                </div>
                <Link href="/roles" className="ghost-button" style={{ fontSize: "0.88rem", padding: "8px 16px" }}>
                  Browse all <ArrowRight size={13} />
                </Link>
              </div>

              {openRoles.length === 0 ? (
                <div className="panel dashboard-empty">
                  <Clapperboard size={28} className="dashboard-empty-icon" />
                  <h4>No open roles right now</h4>
                  <p>Check back soon — new roles are posted daily.</p>
                </div>
              ) : (
                <div className="role-card-grid">
                  {openRoles.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </div>
              )}
            </section>

            {/* Applications */}
            <section style={{ marginTop: 28 }}>
              <div className="panel-heading" style={{ marginBottom: 16 }}>
                <div>
                  <p className="eyebrow">Applications</p>
                  <h3>
                    {applications.length > 0
                      ? `${applications.length} submitted`
                      : "None yet"}
                  </h3>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="panel dashboard-empty">
                  <FileText size={28} className="dashboard-empty-icon" />
                  <h4>You haven't applied to any roles yet</h4>
                  <p>
                    <Link href="/roles" className="dashboard-link">Browse open roles →</Link>
                  </p>
                </div>
              ) : (
                <div className="application-list">
                  {applications.map((app) => {
                    const role = app.role;
                    const now = new Date();
                    const deadlinePassed = role.deadline
                      ? new Date(role.deadline) < new Date(now.toDateString())
                      : false;
                    const isClosed = role.status === "closed" || deadlinePassed;

                    let statusLabel = "Open";
                    let statusClass = "app-status--open";
                    if (role.status === "closed") {
                      statusLabel = "Closed";
                      statusClass = "app-status--closed";
                    } else if (deadlinePassed) {
                      statusLabel = "Deadline Passed";
                      statusClass = "app-status--closed";
                    }

                    return (
                      <Link
                        key={app.id}
                        href={`/roles/${role.id}`}
                        className="application-row"
                      >
                        <div className="application-row-left">
                          {role.project_type && (
                            <span className="role-type-badge" style={{ fontSize: "0.68rem" }}>
                              {PROJECT_TYPE_LABELS[role.project_type] ?? role.project_type}
                            </span>
                          )}
                          <strong className="application-title">{role.title}</strong>
                          {role.project_name && (
                            <span className="application-project">{role.project_name}</span>
                          )}
                        </div>
                        <div className="application-row-right">
                          {role.compensation && (
                            <span className="application-comp">
                              {COMP_LABELS[role.compensation] ?? role.compensation}
                            </span>
                          )}
                          <span className={`app-status ${statusClass}`}>{statusLabel}</span>
                          <span className="application-date">
                            Applied {new Date(app.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                            })}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar ────────────────────────────────────── */}
          <aside className="dashboard-actor-sidebar">

            {/* Profile completeness */}
            <CompletenessCard result={completeness} />

            {/* Media nudge — only if no clips */}
            {mediaCount === 0 && (
              <section className="panel media-nudge">
                <Upload size={22} className="media-nudge-icon" />
                <p className="eyebrow" style={{ marginTop: 12 }}>No clips yet</p>
                <h4>Add your demo reel</h4>
                <p className="muted-copy" style={{ marginTop: 6, fontSize: "0.88rem" }}>
                  Casting directors can't see your work without media. A single clip makes your profile 3× more likely to be viewed.
                </p>
                <Link
                  href="/profile/media"
                  className="primary-button"
                  style={{ marginTop: 16, display: "block", textAlign: "center" }}
                >
                  Upload your first clip →
                </Link>
              </section>
            )}

            {/* Quick links */}
            <section className="panel">
              <p className="eyebrow">Quick Links</p>
              <div className="quick-links">
                <Link href="/profile/edit" className="quick-link">Edit profile</Link>
                <Link href="/profile/media" className="quick-link">Manage media</Link>
                <Link href="/roles" className="quick-link">Browse all roles</Link>
                <Link href="/discovery" className="quick-link">Talent discovery</Link>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </AppShell>
  );
}
