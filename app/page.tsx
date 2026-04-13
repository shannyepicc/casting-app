import Link from "next/link";
import {
  Clapperboard,
  Film,
  PlayCircle,
  Music,
  Tv,
  Mic,
  Camera,
  Gamepad2,
  Star,
  Users,
  Sparkles,
  Search,
  Briefcase,
  BookMarked,
} from "lucide-react";

const productionTypes = [
  { Icon: Film,        label: "Short Film" },
  { Icon: Clapperboard,label: "Feature Film" },
  { Icon: PlayCircle,  label: "YouTube" },
  { Icon: Music,       label: "Music Video" },
  { Icon: Tv,          label: "TV / Streaming" },
  { Icon: Mic,         label: "Podcast" },
  { Icon: Camera,      label: "Photography" },
  { Icon: Gamepad2,    label: "Gaming" },
  { Icon: Sparkles,    label: "Brand Work" },
  { Icon: Users,       label: "Theatre" },
];

export default function HomePage() {
  return (
    <div className="slate-landing">

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="slate-nav">
        <div className="brand-block" style={{ textDecoration: "none", pointerEvents: "none" }}>
          <div className="brand-mark">
            <Clapperboard size={22} />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">Platform</p>
            <h1>Slate</h1>
          </div>
        </div>
        <div className="slate-nav-actions">
          <Link href="/auth/login" className="ghost-button">Sign in</Link>
          <Link href="/auth/signup" className="primary-button">Get started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="slate-hero">
        <p className="eyebrow" style={{ letterSpacing: "0.25em" }}>Talent for any production.</p>
        <h1 className="slate-wordmark">Slate.</h1>
        <p className="slate-sub">
          Discover actors, hosts, musicians, and more. Post roles, review demo reels,
          and book the right person — fast.
        </p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/discovery" className="primary-button" style={{ fontSize: "1.05rem", padding: "14px 28px" }}>
            Find Talent →
          </Link>
          <Link href="/auth/signup" className="ghost-button" style={{ fontSize: "1.05rem", padding: "14px 28px" }}>
            Get Discovered
          </Link>
        </div>
      </section>

      {/* ── Production type strip ───────────────────────────────── */}
      <div className="prod-strip">
        {productionTypes.map(({ Icon, label }) => (
          <div key={label} className="prod-item">
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Value props ─────────────────────────────────────────── */}
      <section className="value-grid">
        <div className="value-card">
          <Search size={28} />
          <strong>Talent-first discovery</strong>
          <p>
            Filter by talent type, skills, age, location, and availability.
            Every profile links directly to real demo clips.
          </p>
        </div>
        <div className="value-card">
          <Briefcase size={28} />
          <strong>One-click applications</strong>
          <p>
            Actors apply using their existing profile — no forms, no friction.
            Just the signal you need to make a decision.
          </p>
        </div>
        <div className="value-card">
          <BookMarked size={28} />
          <strong>Shortlist &amp; compare</strong>
          <p>
            Save your favorites, review their reels side by side, and book
            the right talent with confidence.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────── */}
      <section className="slate-footer-cta">
        <p className="eyebrow" style={{ marginBottom: 12 }}>Ready to cast?</p>
        <h2>Your next production starts here.</h2>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/auth/signup" className="primary-button" style={{ fontSize: "1.05rem", padding: "14px 28px" }}>
            Join the network →
          </Link>
          <Link href="/roles" className="ghost-button" style={{ fontSize: "1.05rem", padding: "14px 28px" }}>
            Browse Open Roles
          </Link>
        </div>
      </section>

    </div>
  );
}
