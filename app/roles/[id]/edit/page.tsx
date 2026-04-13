import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RoleForm } from "@/components/role-form";
import { getRoleById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getRoleById(id);
  if (!role) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/auth/login");

  // Non-owners get bounced to the detail page
  if (authData.user.id !== role.cd_id) redirect(`/roles/${id}`);

  // Applicant count for the warning banner
  const { count: applicantCount } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("role_id", id);

  const hasApplicants = (applicantCount ?? 0) > 0;

  return (
    <AppShell
      eyebrow={role.project_name ?? "Role"}
      title="Edit Role"
      actions={
        <Link href={`/roles/${id}`} className="ghost-button">
          Cancel
        </Link>
      }
    >
      <div className="form-layout">
        {/* ── Main form ─────────────────────────────────────── */}
        <div>
          {hasApplicants && (
            <div className="role-banner role-banner--info" style={{ marginBottom: 20 }}>
              <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This role has{" "}
                <strong>{applicantCount} applicant{applicantCount !== 1 ? "s" : ""}</strong>.
                Changes will not notify them automatically.
              </span>
            </div>
          )}
          <RoleForm initialData={role} mode="edit" />
        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside>
          <section className="panel sticky-panel">
            <p className="eyebrow">Editing your role</p>
            <h3 style={{ marginTop: 6, marginBottom: 12 }}>Changes go live instantly</h3>
            <p className="muted-copy" style={{ fontSize: "0.88rem", lineHeight: 1.65 }}>
              All fields are optional except the role title. Updates are
              visible to actors immediately after saving.
            </p>

            <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
              <Link
                href={`/roles/${id}/applicants`}
                className="ghost-button"
                style={{ textAlign: "center", fontSize: "0.88rem" }}
              >
                View Applicants →
              </Link>
              <Link
                href={`/roles/${id}`}
                className="ghost-button"
                style={{ textAlign: "center", fontSize: "0.88rem" }}
              >
                Back to Role →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
