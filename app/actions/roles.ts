"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createRole(formData: FormData) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  // Verify CD
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", authData.user.id)
    .single();

  if (!["creator", "both"].includes(profile?.account_type ?? "")) redirect("/home");

  const genderRaw = formData.getAll("gender") as string[];

  const payload = {
    cd_id:        authData.user.id,
    title:        formData.get("title") as string,
    project_name: formData.get("project_name") as string || null,
    project_type: formData.get("project_type") as string || null,
    description:  formData.get("description") as string || null,
    gender:       genderRaw.length > 0 ? genderRaw : null,
    age_min:      formData.get("age_min") ? Number(formData.get("age_min")) : null,
    age_max:      formData.get("age_max") ? Number(formData.get("age_max")) : null,
    union_status: formData.get("union_status") as string || null,
    location:     formData.get("location") as string || null,
    compensation: formData.get("compensation") as string || null,
    shoot_dates:  formData.get("shoot_dates") as string || null,
    deadline:     formData.get("deadline") as string || null,
    status:       "open",
  };

  const { data: role, error } = await supabase
    .from("roles")
    .insert(payload)
    .select("id")
    .single();

  if (error || !role) {
    throw new Error(error?.message ?? "Failed to create role");
  }

  // Create a feed post so this role surfaces in the social feed
  await supabase.from("posts").insert({
    author_id: authData.user.id,
    type: "role",
    body: payload.description ?? null,
    role_id: role.id,
  });

  redirect(`/roles/${role.id}`);
}

export async function updateRole(roleId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/login");

  // Verify ownership — only the creator who posted can edit
  const { data: existing } = await supabase
    .from("roles")
    .select("cd_id")
    .eq("id", roleId)
    .single();

  if (!existing || existing.cd_id !== authData.user.id) redirect(`/roles/${roleId}`);

  const genderRaw = formData.getAll("gender") as string[];

  const payload = {
    title:        formData.get("title") as string,
    project_name: (formData.get("project_name") as string) || null,
    project_type: (formData.get("project_type") as string) || null,
    description:  (formData.get("description") as string) || null,
    gender:       genderRaw.length > 0 ? genderRaw : null,
    age_min:      formData.get("age_min") ? Number(formData.get("age_min")) : null,
    age_max:      formData.get("age_max") ? Number(formData.get("age_max")) : null,
    union_status: (formData.get("union_status") as string) || null,
    location:     (formData.get("location") as string) || null,
    compensation: (formData.get("compensation") as string) || null,
    shoot_dates:  (formData.get("shoot_dates") as string) || null,
    deadline:     (formData.get("deadline") as string) || null,
  };

  const { error } = await supabase
    .from("roles")
    .update(payload)
    .eq("id", roleId)
    .eq("cd_id", authData.user.id);

  if (error) throw new Error(error.message);

  redirect(`/roles/${roleId}`);
}

export async function closeRole(roleId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  await supabase
    .from("roles")
    .update({ status: "closed" })
    .eq("id", roleId)
    .eq("cd_id", authData.user.id);

  redirect(`/roles/${roleId}`);
}

export async function reopenRole(roleId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  await supabase
    .from("roles")
    .update({ status: "open" })
    .eq("id", roleId)
    .eq("cd_id", authData.user.id);

  redirect(`/roles/${roleId}`);
}
