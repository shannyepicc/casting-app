import Link from "next/link";
import type { ActorProfile } from "@/lib/supabase/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileCard({
  actor,
  featured = false
}: {
  actor: ActorProfile;
  featured?: boolean;
}) {
  const ageParts = [actor.age?.toString(), actor.gender].filter(Boolean).join(" · ");
  const meta = [ageParts, actor.union_status].filter(Boolean).join(" · ");
  const allTags = [...(actor.skills ?? []).slice(0, 3), ...(actor.tags ?? []).slice(0, 2)];

  return (
    <article className={`actor-card ${featured ? "actor-card-featured" : ""}`}>
      {/* Media area */}
      <div className="actor-media">
        {actor.headshot_url ? (
          <img src={actor.headshot_url} alt={actor.full_name} className="actor-image" />
        ) : (
          <div className="actor-image actor-avatar-placeholder">
            <span>{initials(actor.full_name)}</span>
          </div>
        )}

        <div className="actor-media-overlay">
          {actor.location && (
            <span className="actor-location-badge">{actor.location}</span>
          )}
          {actor.availability && (
            <span className="actor-availability-badge">{actor.availability}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="actor-body">
        {actor.talent_type?.length > 0 && (
          <div className="talent-type-row">
            {actor.talent_type.map((t) => (
              <span key={t} className="talent-type-badge">{t}</span>
            ))}
          </div>
        )}
        <div className="actor-header">
          <div>
            <h3>{actor.full_name}</h3>
            {meta && <p>{meta}</p>}
          </div>
        </div>

        <div className="tag-row" style={{ marginTop: 12 }}>
          {/* Languages as subtle pills */}
          {(actor.languages ?? []).map((lang) => (
            <span key={lang} className="tag tag-lang">
              {lang}
            </span>
          ))}
          {/* Skills + tags */}
          {allTags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {actor.bio && <p className="card-copy">{actor.bio}</p>}

        <div className="card-actions">
          <Link href={`/actors/${actor.username}`} className="primary-button">
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}
