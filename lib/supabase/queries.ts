import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActorProfile = {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  headshot_url: string | null;
  age: number | null;
  gender: string | null;
  union_status: string | null;
  talent_type: string[];
  languages: string[];
  skills: string[];
  tags: string[];
  availability: string | null;
};

export type ActorMedia = {
  id: string;
  title: string | null;
  mux_playback_id: string;
  thumbnail_url: string | null;
  duration: number | null;
  is_featured: boolean;
  sort_order: number;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all discoverable actors.
 * Requires: account_type = actor, onboarding_complete, username and full_name set.
 */
export async function getActorsForDiscovery(): Promise<ActorProfile[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, talent_type, languages, skills, tags, availability"
    )
    .eq("account_type", "actor")
    .eq("onboarding_complete", true)
    .not("username", "is", null)
    .not("full_name", "is", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as ActorProfile[];
}

/**
 * Fetch a single actor by their username, plus their ready public videos.
 * Returns { actor: null } if not found or not an actor.
 */
export async function getActorByUsername(
  username: string
): Promise<{ actor: ActorProfile | null; media: ActorMedia[] }> {
  const supabase = await createClient();

  const { data: actor, error } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, talent_type, languages, skills, tags, availability"
    )
    .eq("username", username)
    .eq("account_type", "actor")
    .single();

  if (error || !actor) return { actor: null, media: [] };

  const { data: media } = await supabase
    .from("media")
    .select("id, title, mux_playback_id, thumbnail_url, duration, is_featured, sort_order")
    .eq("owner_id", actor.id)
    .eq("media_type", "video")
    .eq("status", "ready")
    .eq("is_public", true)
    .not("mux_playback_id", "is", null)
    // featured first, then by sort_order, then most recent
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return {
    actor: actor as ActorProfile,
    media: (media ?? []) as ActorMedia[]
  };
}

// ─── Role Types ───────────────────────────────────────────────────────────────

export type Role = {
  id: string;
  cd_id: string;
  title: string;
  project_name: string | null;
  project_type: string | null;
  description: string | null;
  gender: string[] | null;
  age_min: number | null;
  age_max: number | null;
  union_status: string | null;
  location: string | null;
  compensation: string | null;
  shoot_dates: string | null;
  deadline: string | null;
  status: "open" | "closed";
  created_at: string;
};

export type RoleWithCount = Role & { applicant_count: number };

export type Applicant = {
  id: string;
  created_at: string;
  note: string | null;
  actor: {
    id: string;
    full_name: string;
    username: string | null;
    headshot_url: string | null;
    age: number | null;
    gender: string | null;
    location: string | null;
    union_status: string | null;
    skills: string[] | null;
    tags: string[] | null;
    languages: string[] | null;
  };
};

// ─── Role Queries ─────────────────────────────────────────────────────────────

/** All roles, newest first. Deadline-passed open roles treated as expired in UI. */
export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("roles")
    .select("id, cd_id, title, project_name, project_type, description, gender, age_min, age_max, union_status, location, compensation, shoot_dates, deadline, status, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []) as Role[];
}

/** Single role by ID. */
export async function getRoleById(id: string): Promise<Role | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, cd_id, title, project_name, project_type, description, gender, age_min, age_max, union_status, location, compensation, shoot_dates, deadline, status, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Role;
}

/** All roles posted by a CD, with applicant count. */
export async function getRolesByCd(cdId: string): Promise<RoleWithCount[]> {
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("id, cd_id, title, project_name, project_type, description, gender, age_min, age_max, union_status, location, compensation, shoot_dates, deadline, status, created_at")
    .eq("cd_id", cdId)
    .order("created_at", { ascending: false });

  if (!roles || roles.length === 0) return [];

  // Get applicant counts for all roles in one query
  const roleIds = roles.map((r) => r.id);
  const { data: counts } = await supabase
    .from("applications")
    .select("role_id")
    .in("role_id", roleIds);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.role_id] = (countMap[row.role_id] ?? 0) + 1;
  }

  return roles.map((r) => ({ ...r, applicant_count: countMap[r.id] ?? 0 })) as RoleWithCount[];
}

/** Applicants for a role (CD-only, enforced by RLS). */
export async function getApplicantsForRole(roleId: string): Promise<Applicant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select(`
      id,
      created_at,
      note,
      actor:actor_id (
        id, full_name, username, headshot_url, age, gender,
        location, union_status, skills, tags, languages
      )
    `)
    .eq("role_id", roleId)
    .order("created_at", { ascending: false });

  return ((data ?? []).filter((r) => r.actor)) as unknown as Applicant[];
}
