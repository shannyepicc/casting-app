import { createClient } from "@/lib/supabase/server";
import { type SearchFilters, getAgeRange } from "@/lib/utils/search-params";

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
 * Fetch discoverable actors with optional search filters.
 * Requires: account_type = actor, onboarding_complete, username and full_name set.
 */
export async function getActorsForDiscovery(
  filters: SearchFilters = {}
): Promise<ActorProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, talent_type, languages, skills, tags, availability"
    )
    .eq("account_type", "actor")
    .eq("onboarding_complete", true)
    .not("username", "is", null)
    .not("full_name", "is", null);

  // ── Talent type (array overlap) ──────────────────────────────────────────
  if (filters.type?.length) {
    query = query.overlaps("talent_type", filters.type);
  }

  // ── Age range ────────────────────────────────────────────────────────────
  if (filters.age) {
    const range = getAgeRange(filters.age);
    if (range) {
      query = query.gte("age", range.min).lte("age", range.max);
    }
  }

  // ── Gender ───────────────────────────────────────────────────────────────
  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }

  // ── Location (partial match, case-insensitive) ────────────────────────────
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  // ── Tags / skills (overlap on either array) ──────────────────────────────
  if (filters.tags?.length) {
    query = query.or(
      `tags.ov.{${filters.tags.join(",")}},skills.ov.{${filters.tags.join(",")}}`
    );
  }

  // ── Text search ───────────────────────────────────────────────────────────
  if (filters.q) {
    const q = filters.q.replace(/'/g, "''"); // basic escape
    query = query.or(
      `full_name.ilike.%${q}%,bio.ilike.%${q}%`
    );
  }

  const { data } = await query.order("created_at", { ascending: false });

  return (data ?? []) as ActorProfile[];
}

/** Same as getActorsForDiscovery but also includes 'both' account types (they have actor profiles). */
export async function getActorsForTalent(
  filters: SearchFilters = {}
): Promise<ActorProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, talent_type, languages, skills, tags, availability"
    )
    .in("account_type", ["actor", "both"])
    .eq("onboarding_complete", true)
    .not("username", "is", null)
    .not("full_name", "is", null);

  if (filters.type?.length) query = query.overlaps("talent_type", filters.type);
  if (filters.age) {
    const range = getAgeRange(filters.age);
    if (range) query = query.gte("age", range.min).lte("age", range.max);
  }
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.tags?.length) {
    query = query.or(`tags.ov.{${filters.tags.join(",")}},skills.ov.{${filters.tags.join(",")}}`);
  }
  if (filters.q) {
    const q = filters.q.replace(/'/g, "''");
    query = query.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%`);
  }

  const { data } = await query.order("created_at", { ascending: false });
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
    .in("account_type", ["actor", "both"])
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

// ─── Actor Application Types ──────────────────────────────────────────────────

export type ActorApplication = {
  id: string;
  created_at: string;
  role: {
    id: string;
    title: string;
    project_name: string | null;
    project_type: string | null;
    status: "open" | "closed";
    deadline: string | null;
    compensation: string | null;
  };
};

/** All applications submitted by an actor, newest first. */
export async function getApplicationsByActor(
  actorId: string
): Promise<ActorApplication[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(`
      id,
      created_at,
      role:role_id (
        id, title, project_name, project_type, status, deadline, compensation
      )
    `)
    .eq("actor_id", actorId)
    .order("created_at", { ascending: false });

  return ((data ?? []).filter((r) => r.role)) as unknown as ActorApplication[];
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

// ─── Feed / Social Types ──────────────────────────────────────────────────────

export type FeedPost = {
  id: string;
  type: "update" | "role" | "announcement";
  body: string | null;
  tag: string | null;
  media_url: string | null;
  created_at: string;
  author: {
    id: string;
    username: string | null;
    full_name: string;
    headshot_url: string | null;
    account_type: string;
  };
  role: {
    id: string;
    title: string;
    project_name: string | null;
    project_type: string | null;
    location: string | null;
    compensation: string | null;
    status: string;
    deadline: string | null;
    age_min: number | null;
    age_max: number | null;
    gender: string[] | null;
    description: string | null;
  } | null;
};

/** All posts (feed), newest first. */
export async function getFeedPosts(): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(`
      id, type, body, tag, media_url, created_at,
      author:author_id ( id, username, full_name, headshot_url, account_type ),
      role:role_id ( id, title, project_name, project_type, location, compensation, status, deadline, age_min, age_max, gender, description )
    `)
    .order("created_at", { ascending: false })
    .limit(60);

  return (data ?? []) as unknown as FeedPost[];
}

/** Opportunities feed — role posts only, with optional sort. */
export async function getOpportunities(
  sort: "newest" | "location" = "newest",
  locationFilter?: string,
  typeFilter?: string
): Promise<FeedPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(`
      id, type, body, tag, media_url, created_at,
      author:author_id ( id, username, full_name, headshot_url, account_type ),
      role:role_id ( id, title, project_name, project_type, location, compensation, status, deadline, age_min, age_max, gender, description )
    `)
    .eq("type", "role")
    .not("role_id", "is", null);

  const { data } = await query.order("created_at", { ascending: false }).limit(60);
  const posts = (data ?? []) as unknown as FeedPost[];

  // Client-side filters
  let filtered = posts.filter((p) => p.role?.status === "open");
  if (locationFilter) {
    filtered = filtered.filter((p) =>
      p.role?.location?.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }
  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter((p) => p.role?.project_type === typeFilter);
  }

  return filtered;
}
