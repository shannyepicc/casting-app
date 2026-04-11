"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ShortlistButton({ actorId }: { actorId: string }) {
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCd, setIsCd] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) { setLoading(false); return; }

      // Check if this user is a casting director
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      if (profile?.account_type !== "casting_director") {
        setLoading(false);
        return;
      }

      setIsCd(true);

      // Check if already shortlisted
      const { data: existing } = await supabase
        .from("shortlists")
        .select("id")
        .eq("cd_id", user.id)
        .eq("actor_id", actorId)
        .maybeSingle();

      setSaved(!!existing);
      setLoading(false);
    }

    init();
  }, [actorId]);

  async function toggle() {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { setSaving(false); return; }

    if (saved) {
      await supabase
        .from("shortlists")
        .delete()
        .eq("cd_id", user.id)
        .eq("actor_id", actorId);
      setSaved(false);
    } else {
      await supabase
        .from("shortlists")
        .insert({ cd_id: user.id, actor_id: actorId });
      setSaved(true);
    }

    setSaving(false);
  }

  // Only render for casting directors
  if (!loading && !isCd) return null;

  return (
    <button
      className={saved ? "ghost-button" : "primary-button"}
      onClick={toggle}
      disabled={loading || saving}
      style={{ minWidth: 160 }}
    >
      {loading ? "Loading…" : saving ? "Saving…" : saved ? "✓ Shortlisted" : "Save to Shortlist"}
    </button>
  );
}
