"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/email/client";
import {
  actorApplicationConfirmation,
  creatorNewApplicant,
} from "@/lib/email/templates";

// ─── Apply to a role ──────────────────────────────────────────────────────────

export async function applyToRole(roleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Confirm actor account type
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, full_name, username")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "actor") return { error: "Not an actor" };

  // Prevent duplicate applications
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("role_id", roleId)
    .eq("actor_id", user.id)
    .maybeSingle();

  if (existing) return { error: "Already applied" };

  // Insert application
  const { error: insertError } = await supabase
    .from("applications")
    .insert({ role_id: roleId, actor_id: user.id });

  if (insertError) return { error: insertError.message };

  // ── Fire emails (best-effort — never block the apply action) ─────────────
  try {
    // In dev, onboarding@resend.dev only delivers to the Resend account email.
    // RESEND_DEV_TO overrides all recipients so you can actually test.
    // Remove this override in production once you've verified a sending domain.
    const devOverride = process.env.RESEND_DEV_TO;

    // Fetch role + creator profile in parallel
    const { data: role } = await supabase
      .from("roles")
      .select("id, title, project_name, cd_id")
      .eq("id", roleId)
      .single();

    if (role) {
      const actorName = profile.full_name ?? "An actor";
      const actorEmail = devOverride ?? user.email!;

      // ── Email 1: actor confirmation ──────────────────────────────────────
      const actorTpl = actorApplicationConfirmation({
        actorName,
        roleTitle: role.title,
        projectName: role.project_name,
        roleId: role.id,
      });

      await resend.emails.send({
        from: "Slate <onboarding@resend.dev>",
        to: actorEmail,
        subject: actorTpl.subject,
        html: actorTpl.html,
      });

      // ── Email 2: creator notification (requires service role key) ────────
      const admin = createAdminClient();
      if (admin) {
        const { data: creatorAuth } = await admin.auth.admin.getUserById(role.cd_id);
        const creatorEmail = devOverride ?? creatorAuth?.user?.email;

        if (creatorEmail) {
          const { data: creatorProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", role.cd_id)
            .single();

          const creatorTpl = creatorNewApplicant({
            creatorName: creatorProfile?.full_name ?? "there",
            actorName,
            actorUsername: profile.username,
            roleTitle: role.title,
            roleId: role.id,
          });

          await resend.emails.send({
            from: "Slate <onboarding@resend.dev>",
            to: creatorEmail,
            subject: creatorTpl.subject,
            html: creatorTpl.html,
          });
        }
      }
    }
  } catch (emailErr) {
    // Email failures are non-fatal — application already saved
    console.error("[apply] email error:", emailErr);
  }

  return { success: true };
}

// ─── Withdraw from a role ─────────────────────────────────────────────────────

export async function withdrawFromRole(roleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("role_id", roleId)
    .eq("actor_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
