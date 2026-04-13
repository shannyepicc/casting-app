import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ShortlistPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  // Confirm this user is a casting director
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", authData.user.id)
    .single();

  if (profile?.account_type !== "creator") redirect("/discovery");

  // Fetch shortlisted actors with their profile data
  const { data: shortlistRows } = await supabase
    .from("shortlists")
    .select(`
      id,
      note,
      created_at,
      actor:actor_id (
        id,
        full_name,
        username,
        headshot_url,
        location,
        age,
        gender,
        union_status,
        availability,
        skills,
        tags,
        languages
      )
    `)
    .eq("cd_id", authData.user.id)
    .order("created_at", { ascending: false });

  const entries = (shortlistRows ?? []).filter((r) => r.actor) as Array<{
    id: string;
    note: string | null;
    created_at: string;
    actor: {
      id: string;
      full_name: string;
      username: string | null;
      headshot_url: string | null;
      location: string | null;
      age: number | null;
      gender: string | null;
      union_status: string | null;
      availability: string | null;
      skills: string[] | null;
      tags: string[] | null;
      languages: string[] | null;
    };
  }>;

  return (
    <AppShell
      eyebrow="Creator"
      title="My Shortlist"
    >
      {entries.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p className="eyebrow">No actors saved yet</p>
          <h3 style={{ marginTop: 8 }}>Your shortlist is empty</h3>
          <p className="muted-copy" style={{ marginTop: 8, marginBottom: 24 }}>
            Browse the discovery page and tap &ldquo;Save to Shortlist&rdquo; on any actor profile.
          </p>
          <Link href="/discovery" className="primary-button">
            Browse Actors
          </Link>
        </div>
      ) : (
        <div>
          <p className="muted-copy" style={{ marginBottom: 20 }}>
            {entries.length} actor{entries.length !== 1 ? "s" : ""} saved
          </p>
          <div className="profile-card-grid">
            {entries.map(({ id, actor }) => {
              const ageParts = [actor.age?.toString(), actor.gender]
                .filter(Boolean)
                .join(" · ");
              const allTags = [
                ...(actor.skills ?? []),
                ...(actor.tags ?? []),
              ];

              return (
                <div key={id} className="profile-card">
                  <div className="profile-card-top">
                    {actor.headshot_url ? (
                      <img
                        src={actor.headshot_url}
                        alt={actor.full_name}
                        className="profile-card-avatar"
                      />
                    ) : (
                      <div className="profile-card-avatar actor-avatar-placeholder">
                        <span>{initials(actor.full_name)}</span>
                      </div>
                    )}
                    <div className="profile-card-info">
                      <h3 className="profile-card-name">{actor.full_name}</h3>
                      {ageParts && (
                        <p className="profile-card-meta">{ageParts}</p>
                      )}
                      {actor.location && (
                        <p className="muted-copy" style={{ fontSize: "0.82rem" }}>
                          {actor.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {actor.languages && actor.languages.length > 0 && (
                    <div className="tag-row" style={{ marginTop: 10 }}>
                      {actor.languages.map((lang) => (
                        <span className="tag tag-lang" key={lang}>{lang}</span>
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

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {actor.username && (
                      <Link
                        href={`/actors/${actor.username}` as any}
                        className="primary-button"
                        style={{ flex: 1, textAlign: "center", fontSize: "0.84rem" }}
                      >
                        View Profile
                      </Link>
                    )}
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
