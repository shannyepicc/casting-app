import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { actors } from "@/lib/mock-data";

export default async function ActorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const actor = actors.find((item) => item.slug === slug);

  if (!actor) {
    notFound();
  }

  return (
    <AppShell
      eyebrow="Actor Profile"
      title={actor.name}
      actions={
        <>
          <a href={`mailto:${actor.contactEmail}`} className="ghost-button">
            Email Actor
          </a>
          <button className="primary-button">Save to Shortlist</button>
        </>
      }
    >
      <div className="profile-layout">
        <section className="panel profile-summary">
          <img src={actor.headshot} alt={actor.name} className="profile-portrait" />
          <div className="profile-copy">
            <p className="eyebrow">Core Asset</p>
            <h3>
              {actor.ageRange} • {actor.gender}
            </h3>
            <p>{actor.bio}</p>
            <div className="detail-list">
              <span>{actor.location}</span>
              <span>{actor.unionStatus}</span>
              <span>{actor.availability}</span>
              <span>{actor.languages.join(" • ")}</span>
            </div>
            <div className="tag-row">
              {[...actor.skills, ...actor.tags].map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Demo Reel</p>
              <h3>Instant evaluation</h3>
            </div>
            <span className="muted-copy">{actor.quickStat}</span>
          </div>
          <video className="featured-video" src={actor.reelUrl} controls poster={actor.headshot} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Audition Templates</p>
              <h3>Tagged pre-recorded clips</h3>
            </div>
            <span className="muted-copy">This is the differentiator: emotion + scene type instead of static profile fluff.</span>
          </div>

          <div className="clip-grid">
            {actor.auditionClips.map((clip) => (
              <article className="clip-card" key={clip.title}>
                <video src={clip.videoUrl} controls className="clip-video" poster={actor.headshot} />
                <div className="clip-copy">
                  <h4>{clip.title}</h4>
                  <p>
                    {clip.emotion} • {clip.sceneType} • {clip.duration}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Headshots</p>
              <h3>Lookbook gallery</h3>
            </div>
          </div>
          <div className="gallery-grid">
            {actor.gallery.map((image) => (
              <img key={image} src={image} alt={`${actor.name} headshot`} className="gallery-image" />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
