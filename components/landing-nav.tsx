"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SlateLogo } from "@/components/slate-logo";

export function LandingNav() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null | undefined>(undefined); // undefined = loading
  const [accountType, setAccountType] = useState<"actor" | "creator" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("profiles")
          .select("account_type")
          .eq("id", u.id)
          .single()
          .then(({ data: profile }) => {
            setAccountType((profile?.account_type as "actor" | "creator") ?? null);
          });
      }
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setAccountType(null);
    router.refresh();
  }

  const homeLink = accountType === "creator" ? "/profile/roles" : "/dashboard";

  return (
    <header className="slate-nav">
      <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
        <SlateLogo size={34} />
      </Link>

      <div className="slate-nav-actions">
        {/* Still loading — render nothing to avoid flash */}
        {user === undefined ? null : user ? (
          <>
            <Link href={homeLink} className="ghost-button">
              {accountType === "creator" ? "My Roles" : "Dashboard"}
            </Link>
            <button className="primary-button" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="ghost-button">Sign in</Link>
            <Link href="/auth/signup" className="primary-button">Get started</Link>
          </>
        )}
      </div>
    </header>
  );
}
