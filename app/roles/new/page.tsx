import { AppShell } from "@/components/app-shell";

const inputGroups = [
  { label: "Role Title", placeholder: "College Student Lead" },
  { label: "Project", placeholder: "Deadline Before Dawn" },
  { label: "Age Range", placeholder: "18-24" },
  { label: "Gender", placeholder: "Any" },
  { label: "Location", placeholder: "Berkeley, CA or Remote" }
];

export default function NewRolePage() {
  return (
    <AppShell
      eyebrow="Role Creation"
      title="Post a role in minutes"
      actions={<button className="primary-button">Publish Role</button>}
    >
      <div className="form-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MVP Form</p>
              <h3>Capture only what improves matching</h3>
            </div>
          </div>

          <form className="role-form">
            <div className="form-grid">
              {inputGroups.map((field) => (
                <label key={field.label} className="field">
                  <span>{field.label}</span>
                  <input placeholder={field.placeholder} />
                </label>
              ))}
            </div>

            <label className="field">
              <span>Description</span>
              <textarea placeholder="Describe the role, tone, and what makes someone right for it." rows={6} />
            </label>

            <label className="field">
              <span>Required Traits</span>
              <input placeholder="Fast Talker, College Student, Emotionally Open" />
            </label>

            <label className="field">
              <span>Reference Tags</span>
              <input placeholder="Comedy, Drama, Coming of Age" />
            </label>

            <label className="field checkbox-row">
              <input type="checkbox" defaultChecked />
              <span>Remote auditions accepted</span>
            </label>
          </form>
        </section>

        <section className="panel sticky-panel">
          <p className="eyebrow">What happens next</p>
          <h3>Suggested actors appear instantly</h3>
          <ul className="info-list">
            <li>We rank actors using role tags, traits, and profile fit.</li>
            <li>Casting directors can review reels and audition templates without leaving the page.</li>
            <li>Initial contact stays lightweight through email links instead of a built-in messaging system.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
