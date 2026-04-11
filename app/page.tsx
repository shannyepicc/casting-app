import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page">
      <div className="hero-panel">
        <p className="eyebrow">MVP Direction</p>
        <h1>A searchable database of actors with ready-to-watch audition clips.</h1>
        <p className="hero-copy">
          Tight discovery workflow for indie casting teams: seeded actor profiles, role posting, lightweight match suggestions,
          and clip-first review.
        </p>
        <div className="hero-actions">
          <Link href="/discovery" className="primary-button">
            Open Discovery Dashboard
          </Link>
          <Link href="/roles/new" className="ghost-button">
            Post a Role
          </Link>
        </div>
      </div>
    </main>
  );
}
