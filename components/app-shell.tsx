"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Clapperboard,
  Compass,
  Briefcase,
  User,
  Film,
  Bookmark,
  ListChecks,
  Plus,
  type LucideIcon
} from "lucide-react";

const publicNav: { href: Route; label: string; Icon: LucideIcon }[] = [
  { href: "/discovery", label: "Discovery",    Icon: Compass },
  { href: "/roles",     label: "Browse Roles", Icon: Briefcase },
];

const actorNav: { href: Route; label: string; Icon: LucideIcon }[] = [
  { href: "/discovery",     label: "Discovery",     Icon: Compass },
  { href: "/roles",         label: "Browse Roles",  Icon: Briefcase },
  { href: "/profile/edit",  label: "My Profile",    Icon: User },
  { href: "/profile/media", label: "Media Library", Icon: Film },
];

const cdNav: { href: Route; label: string; Icon: LucideIcon }[] = [
  { href: "/discovery",     label: "Discovery",  Icon: Compass },
  { href: "/shortlist",     label: "Shortlist",  Icon: Bookmark },
  { href: "/profile/roles", label: "My Roles",   Icon: ListChecks },
  { href: "/roles/new",     label: "Post a Role",Icon: Plus },
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
  const [accountType, setAccountType] = useState<"actor" | "creator" | null>(null);
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
      setAccountType((profile?.account_type as "actor" | "creator") ?? null);
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
            setAccountType((profile?.account_type as "actor" | "creator") ?? null);
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
    ? accountType === "creator"
      ? cdNav
      : actorNav
    : publicNav;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <Link href="/" className="brand-block" style={{ textDecoration: "none" }}>
            <div className="brand-mark">
              <Clapperboard size={24} />
            </div>
            <div className="brand-copy">
              <p className="eyebrow">Platform</p>
              <h1>Slate</h1>
            </div>
          </Link>

          <div className="sidebar-status">
            <span className="status-dot" />
            <span>{user ? user.email ?? "Signed in" : "Guest mode"}</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={active ? { borderColor: "var(--line-strong)", background: "rgba(255,255,255,0.88)" } : {}}
                >
                  <item.Icon size={16} className="nav-icon" style={{ opacity: active ? 0.9 : 0.55 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
