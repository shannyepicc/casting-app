"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ApplyButton({ roleId, isClosed }: { roleId: string; isClosed: boolean }) {
  const supabase = createClient();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "guest" | "not_actor" | "applied" | "open">("loading");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { setState("guest"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", authData.user.id)
        .single();

      if (profile?.account_type !== "actor") { setState("not_actor"); return; }

      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("role_id", roleId)
        .eq("actor_id", authData.user.id)
        .maybeSingle();

      setState(existing ? "applied" : "open");
    }
    init();
  }, [roleId]);

  async function apply() {
    setWorking(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { router.push("/auth/login"); return; }

    await supabase.from("applications").insert({
      role_id: roleId,
      actor_id: authData.user.id,
    });
    setState("applied");
    setWorking(false);
  }

  async function withdraw() {
    setWorking(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setWorking(false); return; }

    await supabase
      .from("applications")
      .delete()
      .eq("role_id", roleId)
      .eq("actor_id", authData.user.id);

    setState("open");
    setWorking(false);
  }

  if (state === "loading") {
    return <button className="primary-button" disabled style={{ minWidth: 180 }}>Loading…</button>;
  }

  if (state === "guest") {
    return (
      <a href="/auth/login" className="primary-button" style={{ minWidth: 180, textAlign: "center" }}>
        Sign in to Apply
      </a>
    );
  }

  if (state === "not_actor") {
    // CDs see nothing (they own the role side)
    return null;
  }

  if (isClosed) {
    return <button className="ghost-button" disabled style={{ minWidth: 180 }}>Applications Closed</button>;
  }

  if (state === "applied") {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="role-status-badge role-status-badge--open" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
          ✓ Applied
        </span>
        <button
          className="ghost-button"
          onClick={withdraw}
          disabled={working}
          style={{ fontSize: "0.84rem" }}
        >
          {working ? "Withdrawing…" : "Withdraw"}
        </button>
      </div>
    );
  }

  return (
    <button className="primary-button" onClick={apply} disabled={working} style={{ minWidth: 180 }}>
      {working ? "Applying…" : "Apply with Profile →"}
    </button>
  );
}
