import Link from "next/link";
import type { ActorProfile } from "@/lib/supabase/queries";
import {
  Star,
  Mic,
  Flame,
  Music,
  Headphones,
  Camera,
  Video,
  Users,
  MapPin,
  type LucideIcon,
} from "lucide-react";

const TALENT_TYPE_ICONS: Record<string, LucideIcon> = {
  "Actor":              Star,
  "Host / Presenter":   Mic,
  "Dancer":             Flame,
  "Musician":           Music,
  "Voice Artist":       Headphones,
  "Model":              Camera,
  "Content Creator":    Video,
  "Background / Extra": Users,
};

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
  featured = false,
}: {
  actor: ActorProfile;
  featured?: boolean;
}) {
  const ageParts = [actor.age?.toString(), actor.gender].filter(Boolean).join(" · ");
  const meta = [ageParts, actor.union_status].filter(Boolean).join(" · ");
  const allTags = [...(actor.skills ?? []).slice(0, 2), ...(actor.tags ?? []).slice(0, 2)];

  return (
    <Link
      href={`/actors/${actor.username}`}
      className={`actor-card-portrait ${featured ? "actor-card-portrait--featured" : ""}`}
    >
      {/* Portrait image */}
      <div className="actor-portrait-image">
        {actor.headshot_url ? (
          <img src={actor.headshot_url} alt={actor.full_name} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(160deg, #162840 0%, #0a1520 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "rgba(201,150,46,0.5)",
              letterSpacing: "-0.03em",
            }}
          >
            {initials(actor.full_name)}
          </div>
        )}

        {/* Availability badge top-left */}
        {actor.availability && (
          <div className="actor-portrait-avail">
            <span className="actor-portrait-avail-dot" />
            {actor.availability}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="actor-portrait-body">
        <div className="actor-portrait-meta">
          <div>
            <p className="actor-portrait-name">{actor.full_name}</p>
            {actor.location && (
              <p className="actor-portrait-sub">
                <MapPin size={11} style={{ flexShrink: 0 }} />
                {actor.location}
              </p>
            )}
            {!actor.location && meta && (
              <p className="actor-portrait-sub">{meta}</p>
            )}
          </div>
        </div>

        {/* Talent type badges */}
        {actor.talent_type?.length > 0 && (
          <div className="actor-portrait-tags">
            {actor.talent_type.slice(0, 2).map((t) => {
              const TypeIcon = TALENT_TYPE_ICONS[t];
              return (
                <span key={t} className="actor-portrait-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {TypeIcon && <TypeIcon size={9} />}
                  {t}
                </span>
              );
            })}
            {allTags.slice(0, 2).map((tag) => (
              <span key={tag} className="actor-portrait-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
