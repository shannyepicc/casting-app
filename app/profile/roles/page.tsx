import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RoleCard } from "@/components/role-card";
import { getRolesByCd } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyRolesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", authData.user.id)
    .single();

  if (profile?.account_type !== "creator") redirect("/discovery");

  const roles = await getRolesByCd(authData.user.id);
  const totalApplicants = roles.reduce((sum, r) => sum + r.applicant_count, 0);

  return (
    <AppShell
      eyebrow="Creator"
      title="My Roles"
      actions={
        <Link href="/roles/new" className="primary-button">
          + Post a Role
        </Link>
      }
    >
      {roles.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p className="eyebrow">No roles posted yet</p>
          <h3 style={{ marginTop: 8 }}>Start your first casting call</h3>
          <p className="muted-copy" style={{ marginTop: 8, marginBottom: 24 }}>
            Post a role and actors on the platform can apply instantly.
          </p>
          <Link href="/roles/new" className="primary-button">
            Post a Role
          </Link>
        </div>
      ) : (
        <div>
          {/* Stats strip */}
          <div className="stats-strip" style={{ marginBottom: 28 }}>
            <div className="stat-block">
              <strong>{roles.length}</strong>
              <span>roles posted</span>
            </div>
            <div className="stat-block">
              <strong>{roles.filter((r) => r.status === "open").length}</strong>
              <span>open</span>
            </div>
            <div className="stat-block">
              <strong>{totalApplicants}</strong>
              <span>total applicants</span>
            </div>
          </div>

          <div className="role-manage-list">
            {roles.map((role) => (
              <div key={role.id} className="role-manage-row">
                <div className="role-manage-card">
                  <RoleCard role={role} applicantCount={role.applicant_count} />
                </div>
                <Link
                  href={`/roles/${role.id}/applicants`}
                  className="ghost-button"
                  style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
                >
                  {role.applicant_count} Applicant{role.applicant_count !== 1 ? "s" : ""} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
