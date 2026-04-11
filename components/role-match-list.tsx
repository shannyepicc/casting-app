import type { Route } from "next";
import Link from "next/link";
import { matchActorsForRole } from "@/lib/mock-data";
import { Role } from "@/lib/types";

export function RoleMatchList({ role }: { role: Role }) {
  const matches = matchActorsForRole(role);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Suggested Actors</p>
          <h3>Lightweight AI matching</h3>
        </div>
        <span className="muted-copy">Top matches based on tags, role traits, and location readiness.</span>
      </div>

      <div className="match-list">
        {matches.map(({ actor, score }) => (
          <article key={actor.id} className="match-row">
            <img src={actor.headshot} alt={actor.name} className="match-avatar" />
            <div className="match-copy">
              <div className="match-title-row">
                <div>
                  <h4>{actor.name}</h4>
                  <p className="match-subtitle">{actor.quickStat}</p>
                </div>
                <span className="match-score">{score}/10 fit</span>
              </div>
              <p>
                {actor.ageRange} • {actor.location} • {actor.unionStatus}
              </p>
              <div className="tag-row">
                {actor.tags.slice(0, 3).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="match-note">
                Best clip: {actor.auditionClips[0]?.emotion} {actor.auditionClips[0]?.sceneType.toLowerCase()} •{" "}
                {actor.auditionClips[0]?.duration}
              </p>
            </div>
            <div className="match-actions">
              <a href={`mailto:${actor.contactEmail}?subject=Audition%20Invite%20for%20${role.title}`} className="ghost-button">
                Invite
              </a>
              <Link href={`/actors/${actor.slug}` as Route} className="primary-button">
                Review
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
