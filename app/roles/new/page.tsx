import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoleForm } from "@/components/role-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewRolePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", authData.user.id)
    .single();

  if (profile?.account_type !== "creator") redirect("/discovery");

  return (
    <AppShell
      eyebrow="Role Creation"
      title="Post a Role"
    >
      <div className="form-layout">
        <section className="panel">
          <div className="panel-heading" style={{ marginBottom: 24 }}>
            <div>
              <p className="eyebrow">New Casting Call</p>
              <h3>Capture only what improves matching</h3>
            </div>
          </div>
          <RoleForm />
        </section>

        <section className="panel sticky-panel">
          <p className="eyebrow">What happens next</p>
          <h3 style={{ marginTop: 6, marginBottom: 16 }}>Your role goes live instantly</h3>
          <ul className="info-list">
            <li>Actors on the platform can browse and apply using their existing profile.</li>
            <li>You'll see every applicant's headshot, reel, and tags on the applicants page.</li>
            <li>Add strong applicants straight to your shortlist without leaving the page.</li>
            <li>Close the role anytime — it stays visible but locked to new applications.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
