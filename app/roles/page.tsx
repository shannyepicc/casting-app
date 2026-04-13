import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RoleCard } from "@/components/role-card";
import { getRoles } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const roles = await getRoles();
  const openRoles = roles.filter(
    (r) => r.status === "open" && (!r.deadline || new Date(r.deadline) >= new Date(new Date().toDateString()))
  );
  const closedRoles = roles.filter(
    (r) => r.status === "closed" || (r.deadline && new Date(r.deadline) < new Date(new Date().toDateString()))
  );

  return (
    <AppShell
      eyebrow="Casting Board"
      title="Open Roles"
      actions={
        <Link href="/roles/new" className="primary-button">
          Post a Role
        </Link>
      }
    >
      {roles.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p className="eyebrow">Nothing posted yet</p>
          <h3 style={{ marginTop: 8 }}>No roles open right now</h3>
          <p className="muted-copy" style={{ marginTop: 8, marginBottom: 24 }}>
            Casting directors post roles here. Check back soon.
          </p>
        </div>
      ) : (
        <div>
          {openRoles.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p className="muted-copy" style={{ marginBottom: 16 }}>
                {openRoles.length} open role{openRoles.length !== 1 ? "s" : ""}
              </p>
              <div className="role-card-grid">
                {openRoles.map((role) => (
                  <RoleCard key={role.id} role={role} />
                ))}
              </div>
            </div>
          )}

          {closedRoles.length > 0 && (
            <div>
              <p className="muted-copy" style={{ marginBottom: 16 }}>
                {closedRoles.length} closed / expired
              </p>
              <div className="role-card-grid">
                {closedRoles.map((role) => (
                  <RoleCard key={role.id} role={role} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
