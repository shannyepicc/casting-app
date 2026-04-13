import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ApplyButton } from "@/components/apply-button";
import { getRoleById } from "@/lib/supabase/queries";
import { isEffectivelyClosed, isExpired } from "@/components/role-card";
import { createClient } from "@/lib/supabase/server";
import { closeRole, reopenRole } from "@/app/actions/roles";
import { MapPin, DollarSign, CalendarDays, Clock, Shield, UserCircle, Users, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

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
  paid: "Paid", deferred: "Deferred", copy_credit: "Copy / Credit", unpaid: "Unpaid",
};
const UNION_LABELS: Record<string, string> = {
  union: "Union", non_union: "Non-Union", both: "Union & Non-Union",
};

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getRoleById(id);
  if (!role) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const isOwner = authData.user?.id === role.cd_id;
  const closed = isEffectivelyClosed(role);
  const expired = isExpired(role);

  const ageRange = role.age_min && role.age_max
    ? `${role.age_min} – ${role.age_max}`
    : role.age_min ? `${role.age_min}+`
    : role.age_max ? `Under ${role.age_max}`
    : "Any";

  return (
    <AppShell
      eyebrow={role.project_name ?? "Role Detail"}
      title={role.title}
      actions={
        isOwner ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={`/roles/${role.id}/applicants`} className="ghost-button">
              View Applicants
            </Link>
            <Link href={`/roles/${role.id}/edit`} className="ghost-button" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Pencil size={13} /> Edit
            </Link>
            <form action={closed && !expired ? reopenRole.bind(null, role.id) : closeRole.bind(null, role.id)}>
              <button type="submit" className="ghost-button">
                {closed && !expired ? "Reopen Role" : "Close Role"}
              </button>
            </form>
          </div>
        ) : (
          <ApplyButton roleId={role.id} isClosed={closed} />
        )
      }
    >
      <div className="role-detail-layout">
        {/* ── Status banner ── */}
        {closed && (
          <div className={`role-banner${expired ? " role-banner--expired" : " role-banner--closed"}`}>
            {expired && role.status === "open"
              ? "⏰ The deadline for this role has passed. Applications are closed."
              : "🔒 This role has been closed by the casting director."}
          </div>
        )}

        <div className="role-detail-grid">
          {/* ── Main content ── */}
          <section className="panel">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {role.project_type && (
                <span className="role-type-badge">{PROJECT_TYPE_LABELS[role.project_type] ?? role.project_type}</span>
              )}
              <span className={`role-status-badge ${closed ? "role-status-badge--closed" : "role-status-badge--open"}`}>
                {expired && role.status === "open" ? "Deadline Passed" : role.status === "open" ? "Open" : "Closed"}
              </span>
            </div>

            {role.description && (
              <div className="role-description">
                <p className="eyebrow" style={{ marginBottom: 8 }}>About the Role</p>
                <p style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{role.description}</p>
              </div>
            )}
          </section>

          {/* ── Details sidebar ── */}
          <aside>
            <section className="panel" style={{ marginBottom: 16 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Role Details</p>
              <div className="detail-stack">
                <div className="detail-row">
                  <span className="detail-label">
                    <UserCircle size={12} />
                    Age Range
                  </span>
                  <strong>{ageRange}</strong>
                </div>
                {role.gender && role.gender.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <Users size={12} />
                      Gender
                    </span>
                    <strong>{role.gender.join(" / ")}</strong>
                  </div>
                )}
                {role.union_status && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <Shield size={12} />
                      Union
                    </span>
                    <strong>{UNION_LABELS[role.union_status] ?? role.union_status}</strong>
                  </div>
                )}
                {role.location && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <MapPin size={12} />
                      Location
                    </span>
                    <strong>{role.location}</strong>
                  </div>
                )}
                {role.compensation && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <DollarSign size={12} />
                      Compensation
                    </span>
                    <strong>{COMP_LABELS[role.compensation] ?? role.compensation}</strong>
                  </div>
                )}
                {role.shoot_dates && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <CalendarDays size={12} />
                      Shoot Dates
                    </span>
                    <strong>{role.shoot_dates}</strong>
                  </div>
                )}
                {role.deadline && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <Clock size={12} />
                      Deadline
                    </span>
                    <strong className={expired ? "text-expired" : ""}>
                      {new Date(role.deadline).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </strong>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">
                    <CalendarDays size={12} />
                    Posted
                  </span>
                  <strong>
                    {new Date(role.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </strong>
                </div>
              </div>
            </section>

            {/* Apply block for non-owners */}
            {!isOwner && (
              <section className="panel" style={{ textAlign: "center" }}>
                <p className="muted-copy" style={{ marginBottom: 16, fontSize: "0.88rem" }}>
                  Apply using your existing actor profile — one click.
                </p>
                <ApplyButton roleId={role.id} isClosed={closed} />
              </section>
            )}

            {isOwner && (
              <section className="panel" style={{ textAlign: "center" }}>
                <Link href={`/roles/${role.id}/applicants`} className="primary-button" style={{ display: "block", textAlign: "center" }}>
                  View Applicants →
                </Link>
              </section>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
