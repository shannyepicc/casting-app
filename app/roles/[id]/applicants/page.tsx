import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ShortlistButton } from "@/components/shortlist-button";
import { getRoleById, getApplicantsForRole } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  const role = await getRoleById(id);
  if (!role) notFound();

  // Only the CD who owns this role can view applicants
  if (role.cd_id !== authData.user.id) redirect(`/roles/${id}`);

  const applicants = await getApplicantsForRole(id);

  return (
    <AppShell
      eyebrow={role.project_name ?? "Applicants"}
      title={`${role.title} — Applicants`}
      actions={
        <Link href={`/roles/${id}`} className="ghost-button">
          ← Back to Role
        </Link>
      }
    >
      {applicants.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p className="eyebrow">No applicants yet</p>
          <h3 style={{ marginTop: 8 }}>Waiting on submissions</h3>
          <p className="muted-copy" style={{ marginTop: 8 }}>
            Share the role link to start collecting applications.
          </p>
        </div>
      ) : (
        <div>
          <p className="muted-copy" style={{ marginBottom: 20 }}>
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
          </p>
          <div className="applicant-grid">
            {applicants.map(({ id: appId, actor, created_at }) => {
              const ageParts = [actor.age?.toString(), actor.gender].filter(Boolean).join(" · ");
              const allTags = [...(actor.skills ?? []), ...(actor.tags ?? [])];

              return (
                <div key={appId} className="applicant-card">
                  <div className="applicant-card-top">
                    {actor.headshot_url ? (
                      <img
                        src={actor.headshot_url}
                        alt={actor.full_name}
                        className="applicant-avatar"
                      />
                    ) : (
                      <div className="applicant-avatar actor-avatar-placeholder">
                        <span>{initials(actor.full_name)}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="applicant-name">{actor.full_name}</h4>
                      {ageParts && <p className="muted-copy" style={{ fontSize: "0.84rem", margin: 0 }}>{ageParts}</p>}
                      {actor.location && <p className="muted-copy" style={{ fontSize: "0.82rem", margin: 0 }}>{actor.location}</p>}
                    </div>
                  </div>

                  {actor.languages && actor.languages.length > 0 && (
                    <div className="tag-row" style={{ marginTop: 10 }}>
                      {actor.languages.map((l) => (
                        <span className="tag tag-lang" key={l}>{l}</span>
                      ))}
                    </div>
                  )}
                  {allTags.length > 0 && (
                    <div className="tag-row" style={{ marginTop: 6 }}>
                      {allTags.slice(0, 4).map((t) => (
                        <span className="tag" key={t}>{t}</span>
                      ))}
                    </div>
                  )}

                  <p className="muted-copy" style={{ fontSize: "0.78rem", marginTop: 10 }}>
                    Applied {new Date(created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {actor.username && (
                      <Link
                        href={`/actors/${actor.username}` as any}
                        className="ghost-button"
                        style={{ flex: 1, textAlign: "center", fontSize: "0.84rem" }}
                      >
                        View Profile
                      </Link>
                    )}
                    <ShortlistButton actorId={actor.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
