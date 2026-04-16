"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PostType = "update" | "announcement";

export type AnnouncementTag =
  | "wrapped"
  | "in_production"
  | "seeking_collaborator"
  | "available";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const type = formData.get("type") as PostType;
  const body = (formData.get("body") as string)?.trim();
  const tag = (formData.get("tag") as AnnouncementTag) || null;

  if (!body) throw new Error("Post body is required");

  const { error } = await supabase.from("posts").insert({
    author_id: authData.user.id,
    type,
    body,
    tag: type === "announcement" ? tag : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/home");
}
