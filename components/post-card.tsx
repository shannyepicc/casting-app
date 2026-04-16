import Link from "next/link";
import type { FeedPost } from "@/lib/supabase/queries";
import { Briefcase, MapPin, DollarSign, Calendar, Film, Mic, Music, Tv, PlayCircle, Camera, Gamepad2, Sparkles, Users } from "lucide-react";
import { ApplyButton } from "@/components/apply-button";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  short_film:   "Short Film",
  feature:      "Feature Film",
  commercial:   "Commercial",
  tv:           "TV / Streaming",
  web_series:   "Web Series",
  theatre:      "Theatre",
  youtube:      "YouTube",
  music_video:  "Music Video",
  podcast:      "Podcast",
  brand:        "Brand Work",
  photography:  "Photography",
  gaming:       "Gaming",
  other:        "Other",
};

const TAG_LABELS: Record<string, { label: string; color: string }> = {
  wrapped:               { label: "🎬 Wrapped",             color: "rgba(74,222,128,0.15)"  },
  in_production:         { label: "🎥 In Production",       color: "rgba(251,191,36,0.15)"  },
  seeking_collaborator:  { label: "🤝 Seeking Collaborator",color: "rgba(139,92,246,0.15)"  },
  available:             { label: "✅ Available for Work",   color: "rgba(201,150,46,0.15)"  },
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  actor:   "Actor",
  creator: "Creator",
  both:    "Actor · Creator",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AuthorAvatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return <img src={url} alt={name} className="post-avatar" />;
  }
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return <div className="post-avatar post-avatar-placeholder">{initials}</div>;
}

export function PostCard({
  post,
  appliedRoleIds = [],
}: {
  post: FeedPost;
  appliedRoleIds?: string[];
}) {
  const { author, role } = post;

  return (
    <article className="post-card">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="post-header">
        <Link href={`/actors/${author.username}`} className="post-author-link">
          <AuthorAvatar name={author.full_name} url={author.headshot_url} />
          <div className="post-author-info">
            <span className="post-author-name">{author.full_name}</span>
            <span className="post-author-meta">
              <span className="post-type-badge">
                {ACCOUNT_TYPE_LABELS[author.account_type] ?? author.account_type}
              </span>
              <span className="post-dot">·</span>
              <span>{timeAgo(post.created_at)}</span>
            </span>
          </div>
        </Link>
      </div>

      {/* ── Body: update / announcement ───────────────────────────── */}
      {post.type !== "role" && (
        <div className="post-body">
          {post.tag && TAG_LABELS[post.tag] && (
            <span
              className="post-tag-pill"
              style={{ background: TAG_LABELS[post.tag].color }}
            >
              {TAG_LABELS[post.tag].label}
            </span>
          )}
          {post.body && <p className="post-text">{post.body}</p>}
        </div>
      )}

      {/* ── Body: role post ───────────────────────────────────────── */}
      {post.type === "role" && role && (
        <div className="post-role-card">
          <div className="post-role-header">
            <div>
              <p className="post-role-title">{role.title}</p>
              {role.project_name && (
                <p className="post-role-project">{role.project_name}</p>
              )}
            </div>
            {role.project_type && (
              <span className="post-role-type-badge">
                {PROJECT_TYPE_LABELS[role.project_type] ?? role.project_type}
              </span>
            )}
          </div>

          <div className="post-role-meta">
            {role.location && (
              <span><MapPin size={12} /> {role.location}</span>
            )}
            {role.compensation && (
              <span><DollarSign size={12} /> {role.compensation}</span>
            )}
            {(role.age_min || role.age_max) && (
              <span>
                Ages {role.age_min ?? "?"} – {role.age_max ?? "?"}
              </span>
            )}
            {role.gender?.length ? (
              <span>{role.gender.join(" / ")}</span>
            ) : null}
          </div>

          {post.body && (
            <p className="post-role-description">{post.body}</p>
          )}

          <div className="post-role-actions">
            <Link href={`/roles/${role.id}`} className="ghost-button" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              View Full Role
            </Link>
            <ApplyButton
              roleId={role.id}
              isClosed={role.status !== "open"}
            />
          </div>
        </div>
      )}
    </article>
  );
}
