import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ComposeBar } from "@/components/compose-bar";
import { getFeedPosts } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  // Get account type for compose bar
  let accountType: "actor" | "creator" | "both" = "actor";
  let appliedRoleIds: string[] = [];

  if (authData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", authData.user.id)
      .single();
    accountType = (profile?.account_type as typeof accountType) ?? "actor";

    // Get actor's existing applications so apply buttons show correct state
    const { data: apps } = await supabase
      .from("applications")
      .select("role_id")
      .eq("actor_id", authData.user.id);
    appliedRoleIds = (apps ?? []).map((a) => a.role_id);
  }

  const posts = await getFeedPosts();

  return (
    <AppShell eyebrow="Feed" title="What's happening">
      <div className="feed-layout">
        {/* Compose bar — only shown to logged-in users */}
        {authData.user && (
          <Suspense>
            <ComposeBar accountType={accountType} />
          </Suspense>
        )}

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="panel feed-empty">
            <p className="eyebrow">Nothing yet</p>
            <h3>The feed is empty</h3>
            <p className="muted-copy">
              Be the first to post an update or share an opportunity.
            </p>
          </div>
        ) : (
          <div className="feed-posts">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                appliedRoleIds={appliedRoleIds}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
