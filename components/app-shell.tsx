import type { Route } from "next";
import Link from "next/link";
import { ReactNode } from "react";

const navItems: { href: Route; label: string }[] = [
  { href: "/discovery", label: "Discovery" },
  { href: "/actors/maya-reyes", label: "Actor Profile" },
  { href: "/roles/new", label: "Post a Role" },
  { href: "/roles/college-student-lead", label: "Role View" }
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
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="brand-block">
            <div className="brand-mark">CA</div>
            <div className="brand-copy">
              <p className="eyebrow">AI Casting Assistant</p>
              <h1>Studio Console</h1>
            </div>
          </div>

          <div className="sidebar-status">
            <span className="status-dot" />
            <span>MVP build • discovery-first workflow</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <span className="nav-index">{`0${index + 1}`}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-card">
            <p className="sidebar-label">Current focus</p>
            <strong>Audition library + discovery</strong>
            <span>Built for indie casting teams who need fast signal, not complicated software.</span>
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
