import Link from "next/link";
import type { Role } from "@/lib/supabase/queries";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  short_film:  "Short Film",
  feature:     "Feature Film",
  youtube:     "YouTube",
  music_video: "Music Video",
  commercial:  "Commercial",
  brand:       "Brand / Sponsored",
  tv:          "TV / Streaming",
  web_series:  "Web Series",
  podcast:     "Podcast",
  photography: "Photography",
  gaming:      "Gaming / Streaming",
  theatre:     "Theatre",
  other:       "Other",
};

const COMP_LABELS: Record<string, string> = {
  paid:         "Paid",
  deferred:     "Deferred",
  copy_credit:  "Copy / Credit",
  unpaid:       "Unpaid",
};

export function isExpired(role: Role): boolean {
  if (!role.deadline) return false;
  return new Date(role.deadline) < new Date(new Date().toDateString());
}

export function isEffectivelyClosed(role: Role): boolean {
  return role.status === "closed" || isExpired(role);
}

export function RoleCard({ role, applicantCount }: { role: Role; applicantCount?: number }) {
  const closed = isEffectivelyClosed(role);
  const expired = isExpired(role);

  const ageRange = role.age_min && role.age_max
    ? `${role.age_min}–${role.age_max}`
    : role.age_min ? `${role.age_min}+`
    : role.age_max ? `Under ${role.age_max}`
    : null;

  const genderLabel = role.gender?.join(" / ") ?? null;

  return (
    <Link href={`/roles/${role.id}`} className={`role-card${closed ? " role-card--closed" : ""}`}>
      <div className="role-card-top">
        <div className="role-card-badges">
          {role.project_type && (
            <span className="role-type-badge">
              {PROJECT_TYPE_LABELS[role.project_type] ?? role.project_type}
            </span>
          )}
          {closed && (
            <span className="role-status-badge role-status-badge--closed">
              {expired && role.status === "open" ? "Deadline Passed" : "Closed"}
            </span>
          )}
          {!closed && (
            <span className="role-status-badge role-status-badge--open">Open</span>
          )}
        </div>

        {applicantCount !== undefined && (
          <span className="role-applicant-count">
            {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <h3 className="role-card-title">{role.title}</h3>
      {role.project_name && (
        <p className="role-card-project">{role.project_name}</p>
      )}

      <div className="role-card-meta">
        {ageRange && <span>{ageRange}</span>}
        {genderLabel && <span>{genderLabel}</span>}
        {role.location && <span>{role.location}</span>}
        {role.compensation && (
          <span className="role-comp-pill">
            {COMP_LABELS[role.compensation] ?? role.compensation}
          </span>
        )}
      </div>

      {role.deadline && (
        <p className={`role-deadline${expired ? " role-deadline--expired" : ""}`}>
          {expired ? "Deadline passed" : `Deadline: ${new Date(role.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        </p>
      )}
    </Link>
  );
}
