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
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, languages, skills, tags, availability"
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
      "id, username, full_name, bio, location, headshot_url, age, gender, union_status, languages, skills, tags, availability"
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
