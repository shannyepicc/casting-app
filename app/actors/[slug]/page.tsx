import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoGrid } from "@/components/video-grid";
import { ShortlistButton } from "@/components/shortlist-button";
import { getActorByUsername } from "@/lib/supabase/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ActorProfilePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { actor, media } = await getActorByUsername(slug);

  if (!actor) notFound();

  const ageParts = [actor.age?.toString(), actor.gender].filter(Boolean).join(" · ");

  return (
    <AppShell
      eyebrow="Actor Profile"
      title={actor.full_name}
      actions={<ShortlistButton actorId={actor.id} />}
    >
      <div className="profile-layout">

        {/* ── Summary ───────────────────────────────────────────── */}
        <section className="panel profile-summary">
          {actor.headshot_url ? (
            <img
              src={actor.headshot_url}
              alt={actor.full_name}
              className="profile-portrait"
            />
          ) : (
            <div className="profile-portrait actor-avatar-placeholder profile-avatar-lg">
              <span>{initials(actor.full_name)}</span>
            </div>
          )}

          <div className="profile-copy">
            {actor.talent_type?.length > 0 ? (
              <div className="talent-type-row" style={{ marginBottom: 8 }}>
                {actor.talent_type.map((t) => (
                  <span key={t} className="talent-type-badge">{t}</span>
                ))}
              </div>
            ) : (
              <p className="eyebrow">Actor Profile</p>
            )}
            {ageParts && <h3>{ageParts}</h3>}
            {actor.bio && <p>{actor.bio}</p>}

            <div className="detail-list">
              {actor.location && <span>{actor.location}</span>}
              {actor.union_status && <span>{actor.union_status}</span>}
              {actor.availability && <span>{actor.availability}</span>}
              {actor.languages?.length > 0 && (
                <span>{actor.languages.join(" · ")}</span>
              )}
            </div>

            {(actor.skills?.length > 0 || actor.tags?.length > 0) && (
              <div className="tag-row">
                {[...(actor.skills ?? []), ...(actor.tags ?? [])].map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Video clips ───────────────────────────────────────── */}
        {media.length > 0 && (
          <section className="panel">
            <div className="panel-heading" style={{ marginBottom: 4 }}>
              <div>
                <p className="eyebrow">Clips</p>
                <h3>
                  {media.length} clip{media.length !== 1 ? "s" : ""}
                </h3>
              </div>
              <span className="muted-copy">Click any clip to watch</span>
            </div>
            <VideoGrid media={media} />
          </section>
        )}

        {/* ── No media state ────────────────────────────────────── */}
        {media.length === 0 && (
          <section className="panel">
            <p className="eyebrow">Media</p>
            <h3>No clips uploaded yet</h3>
            <p className="muted-copy" style={{ marginTop: 8 }}>
              This actor hasn&apos;t published any video clips yet.
            </p>
          </section>
        )}

      </div>
    </AppShell>
  );
}
