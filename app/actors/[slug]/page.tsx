import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MuxPlayer } from "@/components/mux-player";
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

  const featuredMedia = media.find((m) => m.is_featured) ?? media[0] ?? null;
  const otherClips = media.filter((m) => m.id !== featuredMedia?.id);

  const ageParts = [actor.age?.toString(), actor.gender].filter(Boolean).join(" · ");

  return (
    <AppShell
      eyebrow="Actor Profile"
      title={actor.full_name}
      actions={<button className="primary-button">Save to Shortlist</button>}
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
            <p className="eyebrow">Actor Profile</p>
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

        {/* ── Featured reel ─────────────────────────────────────── */}
        {featuredMedia && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Demo Reel</p>
                <h3>{featuredMedia.title ?? "Featured clip"}</h3>
              </div>
              {featuredMedia.duration && (
                <span className="muted-copy">
                  {Math.round(featuredMedia.duration)}s
                </span>
              )}
            </div>
            <MuxPlayer
              playbackId={featuredMedia.mux_playback_id}
              title={featuredMedia.title ?? actor.full_name}
              thumbnail={featuredMedia.thumbnail_url ?? undefined}
            />
          </section>
        )}

        {/* ── Additional clips ──────────────────────────────────── */}
        {otherClips.length > 0 && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Audition Clips</p>
                <h3>More from {actor.full_name.split(" ")[0]}</h3>
              </div>
              <span className="muted-copy">
                {otherClips.length} clip{otherClips.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="clip-grid">
              {otherClips.map((clip) => (
                <article className="clip-card" key={clip.id}>
                  <MuxPlayer
                    playbackId={clip.mux_playback_id}
                    title={clip.title ?? undefined}
                    thumbnail={clip.thumbnail_url ?? undefined}
                    className="clip-video"
                  />
                  <div className="clip-copy">
                    <h4>{clip.title ?? "Untitled clip"}</h4>
                    {clip.duration && (
                      <p>{Math.round(clip.duration)}s</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
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
