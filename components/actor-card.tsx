import type { Route } from "next";
import Link from "next/link";
import { Actor } from "@/lib/types";

export function ActorCard({ actor, featured = false }: { actor: Actor; featured?: boolean }) {
  return (
    <article className={`actor-card ${featured ? "actor-card-featured" : ""}`}>
      <div className="actor-media">
        <img src={actor.headshot} alt={actor.name} className="actor-image" />
        <video
          className="actor-preview"
          src={actor.auditionClips[0]?.videoUrl}
          muted
          loop
          playsInline
          autoPlay
        />
        <div className="preview-badge">Quick Play</div>
        <div className="actor-media-overlay">
          <span className="actor-location-badge">{actor.location}</span>
          <span className="actor-availability-badge">{actor.availability}</span>
        </div>
      </div>

      <div className="actor-body">
        <div className="actor-header">
          <div>
            <h3>{actor.name}</h3>
            <p>
              {actor.ageRange} • {actor.gender} • {actor.unionStatus}
            </p>
          </div>
          <span className="score-pill">{actor.quickStat}</span>
        </div>

        <div className="actor-meta-row">
          <span>{actor.languages.join(" • ")}</span>
          <span>{actor.skills.length} casting tags</span>
        </div>

        <div className="tag-row">
          {actor.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>

        <p className="card-copy">{actor.bio}</p>

        <div className="card-actions">
          <a href={actor.reelUrl} target="_blank" rel="noreferrer" className="ghost-button">
            Watch Reel
          </a>
          <Link href={`/actors/${actor.slug}` as Route} className="primary-button">
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}
