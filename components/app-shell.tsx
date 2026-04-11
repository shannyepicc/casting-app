"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const publicNav: { href: Route; label: string }[] = [
  { href: "/discovery", label: "Discovery" },
];

const actorNav: { href: Route; label: string }[] = [
  { href: "/discovery", label: "Discovery" },
  { href: "/profile/edit", label: "My Profile" },
  { href: "/profile/media", label: "Media Library" },
];

const cdNav: { href: Route; label: string }[] = [
  { href: "/discovery", label: "Discovery" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/roles/new", label: "Post a Role" },
];

export function AppShell({
  children,
  title,
  eyebrow,
  actions
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [accountType, setAccountType] = useState<"actor" | "casting_director" | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    const authUser = data.user ?? null;
    setUser(authUser);
    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", authUser.id)
        .single();
      setAccountType((profile?.account_type as "actor" | "casting_director") ?? null);
    } else {
      setAccountType(null);
    }
    setLoadingUser(false);
  }

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setAccountType((profile?.account_type as "actor" | "casting_director") ?? null);
          });
      } else {
        setAccountType(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = user
    ? accountType === "casting_director"
      ? cdNav
      : actorNav
    : publicNav;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <Link href="/" className="brand-block" style={{ textDecoration: "none" }}>
            <div className="brand-mark">CA</div>
            <div className="brand-copy">
              <p className="eyebrow">Casting Assistant</p>
              <h1>Studio Console</h1>
            </div>
          </Link>

          <div className="sidebar-status">
            <span className="status-dot" />
            <span>{user ? user.email ?? "Signed in" : "Guest mode"}</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                style={pathname === item.href ? { borderColor: "var(--line-strong)", background: "rgba(255,255,255,0.88)" } : {}}
              >
                <span className="nav-index">{`0${index + 1}`}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-card">
            {!loadingUser && (
              <>
                {user ? (
                  <button
                    className="ghost-button"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    <p className="sidebar-label">Join the network</p>
                    <Link href="/auth/signup" className="primary-button" style={{ textAlign: "center", fontSize: "0.88rem" }}>
                      Create account
                    </Link>
                    <Link href="/auth/login" className="ghost-button" style={{ textAlign: "center", fontSize: "0.88rem" }}>
                      Sign in
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="page-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <div className="topbar-actions">{actions}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
