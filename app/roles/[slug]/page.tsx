import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoleMatchList } from "@/components/role-match-list";
import { roles } from "@/lib/mock-data";

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = roles.find((item) => item.slug === slug);

  if (!role) {
    notFound();
  }

  return (
    <AppShell
      eyebrow="Role Page"
      title={role.title}
      actions={
        <>
          <button className="ghost-button">Share Role</button>
          <a href={`mailto:?subject=Casting%20Role%20-%20${role.title}`} className="primary-button">
            Contact Matches
          </a>
        </>
      }
    >
      <div className="role-layout">
        <section className="panel role-overview">
          <div className="role-meta-stack">
            <p className="eyebrow">{role.project}</p>
            <h3>{role.title}</h3>
            <p>{role.description}</p>
          </div>

          <div className="detail-grid">
            <div>
              <span className="detail-label">Age Range</span>
              <strong>{role.ageRange}</strong>
            </div>
            <div>
              <span className="detail-label">Gender</span>
              <strong>{role.gender}</strong>
            </div>
            <div>
              <span className="detail-label">Location</span>
              <strong>{role.location}</strong>
            </div>
            <div>
              <span className="detail-label">Shoot Window</span>
              <strong>{role.shootWindow}</strong>
            </div>
            <div>
              <span className="detail-label">Rate</span>
              <strong>{role.rate}</strong>
            </div>
            <div>
              <span className="detail-label">Posted By</span>
              <strong>{role.createdBy}</strong>
            </div>
          </div>

          <div className="tag-row">
            {role.tags.concat(role.requiredTraits).map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <RoleMatchList role={role} />
      </div>
    </AppShell>
  );
}
