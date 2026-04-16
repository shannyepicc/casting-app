"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Compass,
  Briefcase,
  User,
  Film,
  Bookmark,
  ListChecks,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { SlateLogo } from "@/components/slate-logo";
import { ModeToggle, useModeToggle } from "@/components/mode-toggle";
import type { ActiveMode } from "@/lib/types";

type NavItem = { href: Route; label: string; Icon: LucideIcon };

const publicNav: NavItem[] = [
  { href: "/home",       label: "Home",         Icon: Home },
  { href: "/roles",      label: "Browse Roles", Icon: Briefcase },
  { href: "/discovery",  label: "Talent",       Icon: Compass },
];

const actorNav: NavItem[] = [
  { href: "/home",           label: "Home",          Icon: Home },
  { href: "/opportunities",  label: "Opportunities", Icon: Briefcase },
  { href: "/profile/edit",   label: "My Profile",    Icon: User },
  { href: "/profile/media",  label: "Media Library", Icon: Film },
];

const creatorNav: NavItem[] = [
  { href: "/home",           label: "Home",       Icon: Home },
  { href: "/talent",         label: "Talent",     Icon: Compass },
  { href: "/profile/roles",  label: "My Roles",   Icon: ListChecks },
  { href: "/roles/new",      label: "Post a Role",Icon: Plus },
  { href: "/shortlist",      label: "Shortlist",  Icon: Bookmark },
];

function getNavItems(
  accountType: "actor" | "creator" | "both" | null,
  activeMode: ActiveMode
): NavItem[] {
  if (!accountType) return publicNav;
  if (accountType === "actor") return actorNav;
  if (accountType === "creator") return creatorNav;
  // both — use active mode
  return activeMode === "creator" ? creatorNav : actorNav;
}

export function AppShell({
  children,
  title,
  eyebrow,
  actions,
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
  const [accountType, setAccountType] = useState<"actor" | "creator" | "both" | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mode, setMode] = useModeToggle();

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
      setAccountType((profile?.account_type as typeof accountType) ?? null);
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
            setAccountType((profile?.account_type as typeof accountType) ?? null);
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

  const navItems = loadingUser ? [] : getNavItems(accountType, mode);

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
            <SlateLogo size={38} />
          </Link>

          {/* Mode toggle — only for 'both' users */}
          {!loadingUser && accountType === "both" && (
            <ModeToggle mode={mode} onChange={setMode} />
          )}

          {/* Auth CTA or user status */}
          {!loadingUser && (
            user ? (
              <div className="sidebar-status">
                <span className="status-dot" />
                <span>{user.email ?? "Signed in"}</span>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                <Link href="/auth/signup" className="primary-button" style={{ textAlign: "center", fontSize: "0.88rem" }}>
                  Create account
                </Link>
                <Link href="/auth/login" className="ghost-button" style={{ textAlign: "center", fontSize: "0.88rem" }}>
                  Sign in
                </Link>
              </div>
            )
          )}

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : ""}
                >
                  <item.Icon size={16} className="nav-icon" style={{ opacity: active ? 1 : 0.55 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {!loadingUser && user && (
            <div className="sidebar-card">
              <button
                className="ghost-button"
                style={{ width: "100%", fontSize: "0.88rem" }}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
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
