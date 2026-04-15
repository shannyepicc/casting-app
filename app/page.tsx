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
import { LandingNav } from "@/components/landing-nav";

const productionTypes = [
  { Icon: Film,         label: "Short Film" },
  { Icon: Clapperboard, label: "Feature Film" },
  { Icon: PlayCircle,   label: "YouTube" },
  { Icon: Music,        label: "Music Video" },
  { Icon: Tv,           label: "TV / Streaming" },
  { Icon: Mic,          label: "Podcast" },
  { Icon: Camera,       label: "Photography" },
  { Icon: Gamepad2,     label: "Gaming" },
  { Icon: Sparkles,     label: "Brand Work" },
  { Icon: Users,        label: "Theatre" },
  { Icon: Star,         label: "Commercial" },
];

// Doubled for seamless marquee loop
const marqueeItems = [...productionTypes, ...productionTypes];

export default function HomePage() {
  return (
    <div className="slate-landing">

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── Cinematic Hero ──────────────────────────────────────── */}
      <section className="slate-hero-cinematic">
        {/* Background image layer */}
        <div className="slate-hero-bg">
          {/* Cinematic dark overlay is handled by ::after in CSS */}
        </div>

        {/* Gold spotlight glow */}
        <div className="slate-hero-spotlight" />

        {/* Hero content */}
        <div className="slate-hero-content">
          {/* Eyebrow pill */}
          <div className="slate-hero-eyebrow">
            <span className="slate-hero-eyebrow-dot" />
            The casting platform for serious creators
          </div>

          {/* Main headline */}
          <h1 className="slate-headline">
            Where talent meets<br />
            <span className="slate-headline-gold">opportunity.</span>
          </h1>

          {/* Sub-headline */}
          <p className="slate-hero-sub">
            Discover actors, hosts, musicians, and more. Post roles, review demo reels,
            and book the right person — fast.
          </p>

          {/* CTAs */}
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/discovery" className="primary-button" style={{ fontSize: "1.05rem", padding: "14px 32px" }}>
              Find Talent →
            </Link>
            <Link href="/auth/signup" className="ghost-button" style={{ fontSize: "1.05rem", padding: "14px 32px" }}>
              Get Discovered
            </Link>
          </div>
        </div>
      </section>

      {/* ── Animated production type strip ──────────────────────── */}
      <div className="prod-strip-marquee">
        <div className="prod-strip-track">
          {marqueeItems.map(({ Icon, label }, i) => (
            <div key={`${label}-${i}`} className="prod-item">
              <Icon size={15} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Value props ─────────────────────────────────────────── */}
      <section className="value-grid">
        <div className="value-card-v2">
          <div className="value-card-v2-icon">
            <Search size={24} />
          </div>
          <strong>Talent-first discovery</strong>
          <p>
            Filter by talent type, skills, age, location, and availability.
            Every profile links directly to real demo clips.
          </p>
        </div>
        <div className="value-card-v2">
          <div className="value-card-v2-icon">
            <Briefcase size={24} />
          </div>
          <strong>One-click applications</strong>
          <p>
            Actors apply using their existing profile — no forms, no friction.
            Just the signal you need to make a decision.
          </p>
        </div>
        <div className="value-card-v2">
          <div className="value-card-v2-icon">
            <BookMarked size={24} />
          </div>
          <strong>Shortlist &amp; compare</strong>
          <p>
            Save your favorites, review their reels side by side, and book
            the right talent with confidence.
          </p>
        </div>
      </section>

      {/* ── Cinematic interlude quote ────────────────────────────── */}
      <section className="slate-interlude">
        <div className="slate-interlude-bg" />
        <div className="slate-interlude-content">
          <blockquote>
            "Every great production starts with the right cast."
          </blockquote>
          <p style={{ marginTop: 18, fontSize: "0.85rem", color: "var(--muted)", fontStyle: "normal", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
            Slate — Built for casting directors &amp; talent
          </p>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────── */}
      <section className="slate-footer-cta">
        <p className="eyebrow" style={{ marginBottom: 12 }}>Ready to cast?</p>
        <h2>Your next production starts here.</h2>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/auth/signup" className="primary-button" style={{ fontSize: "1.05rem", padding: "14px 32px" }}>
            Join the network →
          </Link>
          <Link href="/roles" className="ghost-button" style={{ fontSize: "1.05rem", padding: "14px 32px" }}>
            Browse Open Roles
          </Link>
        </div>
      </section>

    </div>
  );
}
